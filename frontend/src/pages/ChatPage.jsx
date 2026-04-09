import { useState} from 'react'
import { AiMessage, UserMessage, RecipeCard } from '../components/ChatBubble'

const historyGroups = [
  { label: 'Today', chats: ['1500 Calorie Vegan Plan', 'Post-Workout Macros'] },
  { label: 'Yesterday', chats: ['Intermittent Fasting Benefits', 'Avocado Nutrition Breakdown'] },
]

const suggestions = [
  { icon: 'restaurant', title: 'Create a 1500 calorie plan', sub: 'Tailored to weight loss' },
  { icon: 'nutrition', title: "What's in an avocado?", sub: 'Macro breakdown' },
  { icon: 'fitness_center', title: 'Best pre-workout meal?', sub: 'Energy optimization' },
]

const RECIPE = {
  title: 'Spiced Chickpea & Quinoa Power Bowl',
  prep: '18 Min Prep',
  description: 'A mediterranean fusion bowl packed with plant-based protein and healthy fats.',
  protein: 24, calories: 480, fiber: 12,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx6MS4bMeaw85OPtsOnTC_8CI7rmcG3BpWgbivTWtNajOGMtfK4e7hg-CFHAVrjPmCoo5-zMAqerXWt2gR3pavJfm7A1XOzCzDDeVG85bOLSTelliOrE4tNsIXReie3nXbo2TB7nFZ18Ni1y7Gh6wVGj9Twwy00q7fJ7oc6TjHDKAGLLfsxldCNoG_6gevMFLOslQoyrPE6VpR9sjT-bDcr897zorqow6mX7VywkFusncMltzLHdzAyZ-ecJt21zm_yqvcBFJdbUw',
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hello! I'm your AI Nutrition Curator. I can help you design meal plans, analyze macros, or understand the science behind your diet. What's on your mind today?" },
    { type: 'user', text: 'I need a high-protein vegetarian dinner idea that takes under 20 minutes to prepare.' },
    { type: 'ai', text: 'Great choice! Here is a curated high-protein recipe that fits your criteria:' },
    { type: 'recipe' },
  ])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [
      ...prev,
      { type: 'user', text },
      { type: 'ai', text: 'Great question! Let me curate the perfect nutrition plan for you based on your goals and dietary preferences.' },
    ])
    setInput('')
  }

  return (
    <div className="pt-20 flex h-screen overflow-hidden max-w-7xl mx-auto w-full px-4 gap-6 pb-20 md:pb-0">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-surface-container-low rounded-lg p-6 h-[calc(100vh-6rem)] my-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-xl font-bold">Recent Curations</h2>
          <button className="material-symbols-outlined text-primary">edit_square</button>
        </div>
        <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
          {historyGroups.map(({ label, chats }, gi) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2 px-3">{label}</p>
              <div className="space-y-2">
                {chats.map((chat, ci) => (
                  <div
                    key={chat}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${gi === 0 && ci === 0 ? 'bg-surface-container-lowest shadow-ambient-sm' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                  >
                    <p className="text-sm font-semibold text-on-surface truncate">{chat}</p>
                    <p className="text-xs text-outline mt-0.5">{gi === 0 ? (ci === 0 ? '3 min ago' : '2 hours ago') : '1 day ago'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 p-3 bg-primary-container/10 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container">auto_awesome</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-surface">Premium Access</p>
              <p className="text-[10px] text-primary">Unlimited AI Insights</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Chat main canvas ── */}
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
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-outline">AI System Online</span>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
          {messages.map((msg, i) => (
            msg.type === 'ai' ? <AiMessage key={i}>{msg.text}</AiMessage>
            : msg.type === 'user' ? <UserMessage key={i}>{msg.text}</UserMessage>
            : <RecipeCard key={i} {...RECIPE} />
          ))}

          {/* Suggestions */}
          <div className="pt-8 border-t border-surface-variant/20">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              Suggested Curations
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {suggestions.map(({ icon, title, sub }) => (
                <button
                  key={title}
                  onClick={() => setInput(title)}
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
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white/40 backdrop-blur-sm border-t border-surface-container-low">
          <div className="max-w-4xl mx-auto flex items-center gap-3 bg-surface-container-high rounded-full px-5 py-2 border border-transparent focus-within:border-primary/20 focus-within:bg-surface-container-lowest focus-within:shadow-ambient transition-all">
            <button className="text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-3 text-sm text-on-surface placeholder:text-outline/60"
              placeholder="Ask about diet, calories, or fitness..."
            />
            <button
              onClick={sendMessage}
              className="primary-gradient text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-primary-sm active:scale-95 transition-transform flex-shrink-0"
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
