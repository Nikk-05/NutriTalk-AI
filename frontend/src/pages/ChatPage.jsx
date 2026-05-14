// ChatPage.jsx — real-time AI nutrition chat.
// Messages are sent to the FastAPI AI service (port 8000) at POST /api/chat/stream.
// The response is an SSE stream: each chunk is either a text delta, a recipe_card
// structured event, or a final "done" event.
// User context (goal, diet, calories) is read from Redux and forwarded to the AI
// so it can personalise its responses.

import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { AiMessage, UserMessage, RecipeCard } from '../components/ChatBubble'
import { selectUser } from '../store/slices/authSlice'
import { API, CHAT } from '../constants/appConstants'

export default function ChatPage() {
  const user = useSelector(selectUser)

  const [input,     setInput]     = useState('')
  const [streaming, setStreaming] = useState(false) // true while a response is in flight
  const [messages,  setMessages]  = useState([
    { id: 0, type: 'ai', text: CHAT.WELCOME_MESSAGE, streaming: false },
  ])

  // Sidebar chat groups — tracks titles of this session's conversations
  const [sessionChats, setSessionChats] = useState([])

  // Ref used to auto-scroll the message list to the latest message
  const bottomRef = useRef(null)

  // Auto-scroll whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send a message and stream the AI response ──────────────
  const sendMessage = async (text = input.trim()) => {
    if (!text || streaming) return

    const userMsgId = Date.now()
    const aiMsgId   = userMsgId + 1

    // Add user bubble + placeholder AI bubble (will fill with streamed tokens)
    setMessages(prev => [
      ...prev,
      { id: userMsgId, type: 'user', text },
      { id: aiMsgId,   type: 'ai',   text: '', streaming: true },
    ])
    setInput('')
    setStreaming(true)

    // Track conversation title from the first user message
    if (messages.length === 1) {
      setSessionChats(prev => [{ label: text.slice(0, 40), ts: 'Just now' }, ...prev])
    }

    // Build history from existing messages (exclude the new placeholder AI message)
    const history = messages
      .filter(m => m.type !== 'recipe' && !m.streaming && m.text)
      .map(m => ({
        role:    m.type === 'user' ? 'user' : 'ai',
        content: m.text,
      }))

    // User context forwarded to the AI for personalised responses
    const userContext = user?.preferences
      ? {
          primaryGoal:        user.preferences.primaryGoal,
          dietaryRestriction: user.preferences.dietaryRestriction,
          dailyCalorieTarget: user.preferences.dailyCalorieTarget,
        }
      : null

    try {
      const res = await fetch(`${API.AI_SERVICE_URL}/api/chat/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, user_context: userContext }),
      })

      if (!res.ok) throw new Error(`AI service error: ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // SSE events are separated by double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // hold the incomplete trailing part

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const event = JSON.parse(part.slice(6))

            if (event.delta) {
              // Append streaming token to the placeholder AI message
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: m.text + event.delta } : m
              ))

            } else if (event.type === 'recipe_card') {
              // Insert a structured recipe card message after the AI text bubble
              setMessages(prev => [
                ...prev,
                { id: Date.now(), type: 'recipe', recipe: event.data },
              ])

            } else if (event.done) {
              // Stream complete — replace streaming text with the clean full message
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? { ...m, text: event.fullMessage || m.text, streaming: false }
                  : m
              ))
            } else if (event.error) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? { ...m, text: `Error: ${event.error}`, streaming: false }
                  : m
              ))
            }
          } catch {
            // Ignore malformed SSE frames
          }
        }
      }
    } catch (err) {
      // Network error or AI service down — show fallback message
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, text: 'Sorry, I couldn\'t reach the AI service. Please make sure the backend is running and try again.', streaming: false }
          : m
      ))
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="pt-20 flex h-screen overflow-hidden max-w-7xl mx-auto w-full px-4 gap-6 pb-20 md:pb-0">

      {/* ── Sidebar — recent chats in this session ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface-container-low rounded-lg p-6 h-[calc(100vh-6rem)] my-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-xl font-bold">Recent Curations</h2>
          <button
            onClick={() => {
              // Start a new chat — reset messages to the welcome message only
              setMessages([{ id: 0, type: 'ai', text: CHAT.WELCOME_MESSAGE, streaming: false }])
              setInput('')
            }}
            className="material-symbols-outlined text-primary hover:text-primary/80 transition-colors"
            title="New chat"
          >
            edit_square
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto no-scrollbar flex-1">
          {sessionChats.length > 0 ? (
            sessionChats.map((chat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl cursor-pointer bg-surface-container-low hover:bg-surface-container-high transition-all"
              >
                <p className="text-sm font-semibold text-on-surface truncate">{chat.label}</p>
                <p className="text-xs text-outline mt-0.5">{chat.ts}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-outline px-3">No chats yet. Start a conversation!</p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 p-3 bg-primary-container/10 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">auto_awesome</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">
                {user?.plan === 'pro' || user?.plan === 'elite' ? 'Premium Access' : 'Free Tier'}
              </p>
              <p className="text-[10px] text-primary">Unlimited AI Insights</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Chat canvas ── */}
      <section className="flex-1 flex flex-col bg-surface-container-lowest rounded-lg shadow-ambient my-4 overflow-hidden">

        {/* Chat header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-surface-container-low z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center shadow-primary-sm">
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div>
              <h1 className="font-headline font-bold text-on-surface leading-tight">NutriTalk Curator</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${streaming ? 'bg-secondary animate-pulse' : 'bg-primary animate-pulse'}`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-outline">
                  {streaming ? 'Generating response...' : 'AI System Online'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          {messages.map((msg) => {
            if (msg.type === 'user') {
              return <UserMessage key={msg.id}>{msg.text}</UserMessage>
            }
            if (msg.type === 'recipe') {
              return <RecipeCard key={msg.id} {...msg.recipe} />
            }
            // AI message — show typing dots while streaming with no text yet
            return (
              <AiMessage key={msg.id}>
                {msg.text || (msg.streaming ? (
                  <span className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-outline/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-outline/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-outline/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : '')}
              </AiMessage>
            )
          })}

          {/* Suggestion chips — only shown before user sends first message */}
          {messages.length === 1 && (
            <div className="pt-8 border-t border-surface-variant/20">
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
                Suggested Curations
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CHAT.SUGGESTIONS.map(({ icon, title, sub }) => (
                  <button
                    key={title}
                    onClick={() => sendMessage(title)}
                    className="bg-surface-container-low hover:bg-surface-container-high transition-all p-4 rounded-xl text-left flex items-start gap-3 active:scale-95 group"
                  >
                    <span className="material-symbols-outlined text-primary mt-0.5">{icon}</span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{title}</p>
                      <p className="text-[10px] text-outline">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invisible anchor for auto-scroll */}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-4 md:p-6 bg-white/40 backdrop-blur-sm border-t border-surface-container-low">
          <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container-high rounded-full px-5 py-2 border border-transparent focus-within:border-primary/20 focus-within:bg-surface-container-lowest focus-within:shadow-ambient transition-all">
            <button className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={streaming}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-3 text-sm text-on-surface placeholder:text-outline/60 disabled:opacity-50"
              placeholder={streaming ? 'NutriTalk is thinking...' : 'Ask about diet, calories, or fitness...'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="primary-gradient text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-primary-sm active:scale-95 transition-transform flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
          <p className="text-[10px] text-center text-outline mt-3">
            NutriTalk AI may provide inaccurate info. Verify with a professional.
          </p>
        </div>
      </section>
    </div>
  )
}