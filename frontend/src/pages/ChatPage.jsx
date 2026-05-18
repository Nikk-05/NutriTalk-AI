// ChatPage.jsx — real-time AI nutrition chat.
//
// Flow:
//   Mount             → GET /api/chats → populate sidebar with persisted chats
//   First message     → POST /api/chats (create chat + get threadId) → then stream
//   Subsequent msgs   → POST /api/chats/:id/messages/stream (same chatId)
//   Click sidebar     → GET /api/chats/:id/messages → restore history
//   New Chat button   → clears active chat; next message auto-creates a new one
//
// Streaming uses raw fetch (SSE) with the JWT from sessionStorage.
// User context is NOT sent from the frontend — Node.js reads it from req.user.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { AiMessage, UserMessage, RecipeCard } from '../components/ChatBubble'
import { selectUser } from '../store/slices/authSlice'
import { fetchAPI } from '../utils/apiCalls'
import { API, CHAT } from '../constants/appConstants'

export default function ChatPage() {
  const user = useSelector(selectUser)

  const [chats,        setChats]        = useState([])   // sidebar list from GET /api/chats
  const [activeChatId, setActiveChatId] = useState(null) // currently open chat _id
  const [messages,     setMessages]     = useState([     // messages rendered in the canvas
    { id: 0, type: 'ai', text: CHAT.WELCOME_MESSAGE, streaming: false },
  ])
  const [input,        setInput]        = useState('')
  const [streaming,    setStreaming]    = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMsgs,  setLoadingMsgs]  = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load sidebar on mount
  useEffect(() => {
    loadChats()
  }, [])

  // ── Load sidebar list ──────────────────────────────────────
  const loadChats = async () => {
    setLoadingChats(true)
    const res = await fetchAPI('/chats', 'GET')
    if (res.status === 'success') setChats(res.data.chats)
    setLoadingChats(false)
  }

  // ── Click a past chat in sidebar ───────────────────────────
  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId || streaming) return
    setActiveChatId(chatId)
    setLoadingMsgs(true)
    setMessages([])

    const res = await fetchAPI(`/chats/${chatId}/messages`, 'GET')
    if (res.status === 'success') {
      const mapped = res.data.messages.map(m => ({
        id:        m._id,
        type:      m.role === 'user' ? 'user' : 'ai',
        text:      m.content,
        streaming: false,
      }))
      setMessages(mapped.length > 0 ? mapped : [
        { id: 0, type: 'ai', text: CHAT.WELCOME_MESSAGE, streaming: false },
      ])
    }
    setLoadingMsgs(false)
    inputRef.current?.focus()
  }

  // ── New chat button ────────────────────────────────────────
  const handleNewChat = () => {
    if (streaming) return
    setActiveChatId(null)
    setMessages([{ id: 0, type: 'ai', text: CHAT.WELCOME_MESSAGE, streaming: false }])
    setInput('')
    inputRef.current?.focus()
  }

  // ── Send message ───────────────────────────────────────────
  const sendMessage = useCallback(async (text = input.trim()) => {
    if (!text || streaming) return

    const userMsgId = Date.now()
    const aiMsgId   = userMsgId + 1

    setMessages(prev => [
      ...prev,
      { id: userMsgId, type: 'user',  text, streaming: false },
      { id: aiMsgId,   type: 'ai',    text: '', streaming: true },
    ])
    setInput('')
    setStreaming(true)

    try {
      // If no active chat, create one first
      let chatId = activeChatId
      if (!chatId) {
        const createRes = await fetchAPI('/chats', 'POST', { title: 'New Chat' })
        if (createRes.status !== 'created' && createRes.status !== 'success') {
          throw new Error('Failed to create chat session.')
        }
        chatId = createRes.data.chat._id
        setActiveChatId(chatId)
        // Prepend to sidebar immediately
        setChats(prev => [createRes.data.chat, ...prev])
      }

      // Stream: raw fetch with JWT (Axios doesn't support SSE streaming)
      const token = sessionStorage.getItem('token')
      const res = await fetch(`${API.NODE_BASE_URL}/chats/${chatId}/messages/stream`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ content: text }),
      })

      if (!res.ok) throw new Error(`Stream request failed: ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep incomplete trailing part

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          try {
            const event = JSON.parse(part.slice(6))

            if (event.delta) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: m.text + event.delta } : m
              ))
            } else if (event.type === 'recipe_card') {
              setMessages(prev => [
                ...prev,
                { id: Date.now(), type: 'recipe', recipe: event.data },
              ])
            } else if (event.done) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId
                  ? { ...m, text: event.fullMessage || m.text, streaming: false }
                  : m
              ))
              // Refresh sidebar so the title updates after the first message
              loadChats()
            } else if (event.error) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: `Error: ${event.error}`, streaming: false } : m
              ))
            }
          } catch { /* malformed SSE frame — skip */ }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, text: 'Sorry, something went wrong. Please check the backend is running and try again.', streaming: false }
          : m
      ))
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, activeChatId])

  return (
    <div className="pt-20 flex h-screen overflow-hidden max-w-7xl mx-auto w-full px-4 gap-6 pb-20 md:pb-0">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface-container-low rounded-lg p-6 h-[calc(100vh-6rem)] my-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-bold">Recent Chats</h2>
          <button
            onClick={handleNewChat}
            disabled={streaming}
            className="material-symbols-outlined text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
            title="New chat"
          >
            edit_square
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
          {loadingChats ? (
            <div className="space-y-2 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl" />)}
            </div>
          ) : chats.length > 0 ? (
            chats.map(chat => (
              <button
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activeChatId === chat._id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <p className="text-sm font-semibold truncate">{chat.title}</p>
                <p className="text-[10px] text-outline mt-0.5">
                  {new Date(chat.lastMessageAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </button>
            ))
          ) : (
            <p className="text-xs text-outline px-1">No chats yet. Start a conversation!</p>
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

        {/* Header */}
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
            {/* Mobile: new chat */}
            <button
              onClick={handleNewChat}
              disabled={streaming}
              className="lg:hidden p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container disabled:opacity-40"
              title="New chat"
            >
              <span className="material-symbols-outlined">edit_square</span>
            </button>
            <button className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          {loadingMsgs ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`h-10 rounded-2xl bg-surface-container ${i % 2 === 0 ? 'w-48' : 'w-64'}`} />
                </div>
              ))}
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.type === 'user') return <UserMessage key={msg.id}>{msg.text}</UserMessage>
              if (msg.type === 'recipe') return <RecipeCard key={msg.id} {...msg.recipe} />
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
            })
          )}

          {/* Suggestion chips — only before first user message */}
          {messages.length === 1 && !loadingMsgs && (
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

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-4 md:p-6 bg-white/40 backdrop-blur-sm border-t border-surface-container-low">
          <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container-high rounded-full px-5 py-2 border border-transparent focus-within:border-primary/20 focus-within:bg-surface-container-lowest focus-within:shadow-ambient transition-all">
            <button className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              ref={inputRef}
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
