import axios from 'axios';
import mongoose from 'mongoose';
import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import { success, created, notFound, serverError } from '../utils/response.utils.js';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ── GET /chats ─────────────────────────────────────────────
// List all chats for the logged-in user (newest first) for the sidebar.
const getPastChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ lastMessageAt: -1 })
      .select('title summary lastMessageAt createdAt');
    return success(res, { chats });
  } catch (err) { next(err); }
};

// ── POST /chats ────────────────────────────────────────────
// Create a new (empty) chat. Frontend calls this when user clicks "New Chat".
// threadId is generated here and shared with the AI service's checkpointer.
const saveChat = async (req, res, next) => {
  try {
    const threadId = new mongoose.Types.ObjectId().toString();
    const chat = await Chat.create({
      userId: req.user._id,
      title: req.body.title || 'New Chat',
      threadId,
      lastMessageAt: new Date(),
    });
    return created(res, { chat });
  } catch (err) { next(err); }
};

// ── GET /chats/:id ─────────────────────────────────────────
const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return notFound(res, 'Chat not found.');
    return success(res, { chat });
  } catch (err) { next(err); }
};

// ── GET /chats/:id/messages ────────────────────────────────
// Paginated message history for rendering the chat window.
// Query params: ?limit=50&before=<messageId>  (cursor-based for infinite scroll)
const getChatMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return notFound(res, 'Chat not found.');

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const filter = { chatId: chat._id };
    if (req.query.before) filter._id = { $lt: req.query.before };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return success(res, { messages: messages.reverse() }); // oldest → newest for UI
  } catch (err) { next(err); }
};

// ── POST /chats/:id/messages ───────────────────────────────
// Non-streaming: send a message, get a full reply at once.
// Saves both user message and assistant reply to DB.
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return serverError(res, 'Message content is required.');

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return notFound(res, 'Chat not found.');

    // 1. Save user message
    const userMessage = await Message.create({ chatId: chat._id, role: 'user', content });

    // 2. Call AI service — user context comes from req.user, not from the client
    const aiResponse = await axios.post(`${AI_URL}/api/chat/message`, {
      thread_id: chat.threadId,
      message: content,
      user_context: {
        primaryGoal:        req.user.preferences?.primaryGoal,
        dietaryRestriction: req.user.preferences?.dietaryRestriction,
        dailyCalorieTarget: req.user.preferences?.dailyCalorieTarget,
      },
    });

    const assistantContent = aiResponse.data?.data?.message || aiResponse.data?.message;
    if (!assistantContent) return serverError(res, 'AI service returned an empty response.');

    // 3. Save assistant reply
    const assistantMessage = await Message.create({
      chatId: chat._id, role: 'assistant', content: assistantContent,
    });

    // 4. Update chat metadata
    const updates = { lastMessageAt: new Date() };
    if (chat.title === 'New Chat') updates.title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
    await Chat.updateOne({ _id: chat._id }, updates);

    return success(res, { userMessage, assistantMessage });
  } catch (err) {
    if (err.response) return serverError(res, 'AI service error while generating reply.');
    next(err);
  }
};

// ── POST /chats/:id/messages/stream ───────────────────────
// Streaming: saves user message, pipes SSE stream from FastAPI directly to
// the client, then saves the complete assistant reply once the stream ends.
// User context is read from req.user — frontend never needs to send it.
const streamMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return serverError(res, 'Message content is required.');

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return notFound(res, 'Chat not found.');

    // 1. Save user message immediately
    await Message.create({ chatId: chat._id, role: 'user', content });

    // 2. User context from the authenticated user record — not from the client
    const userContext = {
      primaryGoal:        req.user.preferences?.primaryGoal,
      dietaryRestriction: req.user.preferences?.dietaryRestriction,
      dailyCalorieTarget: req.user.preferences?.dailyCalorieTarget,
    };

    // 3. Set SSE headers before streaming begins
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 4. Forward to FastAPI with responseType: 'stream' so axios gives us the raw stream
    const aiRes = await axios.post(
      `${AI_URL}/api/chat/stream`,
      { thread_id: chat.threadId, message: content, user_context: userContext },
      { responseType: 'stream' }
    );

    let fullMessage = '';

    // 5. Pipe each SSE chunk straight to client; capture fullMessage from the done event
    aiRes.data.on('data', (chunk) => {
      const raw = chunk.toString();
      res.write(raw);

      // Parse out the fullMessage so we can persist it after the stream ends
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.done && event.fullMessage) fullMessage = event.fullMessage;
        } catch { /* malformed frame — skip */ }
      }
    });

    // 6. Stream ended — persist assistant reply and update chat metadata
    aiRes.data.on('end', async () => {
      try {
        if (fullMessage) {
          await Message.create({ chatId: chat._id, role: 'assistant', content: fullMessage });
        }
        const updates = { lastMessageAt: new Date() };
        if (chat.title === 'New Chat') {
          updates.title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
        }
        await Chat.updateOne({ _id: chat._id }, updates);
      } catch (saveErr) {
        console.error('[Chat] Failed to persist assistant message:', saveErr.message);
      }
      res.end();
    });

    aiRes.data.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: 'AI stream error: ' + err.message })}\n\n`);
      res.end();
    });

    // Clean up FastAPI connection if the client disconnects early
    req.on('close', () => aiRes.data.destroy());

  } catch (err) {
    if (err.response) {
      res.write(`data: ${JSON.stringify({ error: 'AI service unavailable.' })}\n\n`);
      return res.end();
    }
    next(err);
  }
};

// ── DELETE /chats/:id ──────────────────────────────────────
// Delete the chat and all its messages.
// NOTE: This does not clear the LangGraph checkpointer state — add a call to
// the AI service to drop the thread if you want a hard delete.
const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) return notFound(res, 'Chat not found.');
    await Message.deleteMany({ chatId: chat._id });
    return success(res, { message: 'Chat deleted.' });
  } catch (err) { next(err); }
};

// ── PATCH /chats/:id ───────────────────────────────────────
// Rename a chat (manual title override).
const updateChatTitle = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return serverError(res, 'Title is required.');

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );
    if (!chat) return notFound(res, 'Chat not found.');
    return success(res, { chat });
  } catch (err) { next(err); }
};

export default {
  getPastChats,
  saveChat,
  getChatById,
  getChatMessages,
  sendMessage,
  streamMessage,
  deleteChat,
  updateChatTitle,
};
