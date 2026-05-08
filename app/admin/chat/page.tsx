"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Search, 
  Send, 
  MoreVertical, 
  User, 
  Phone, 
  Video, 
  CheckCheck,
  Filter,
  Circle
} from "lucide-react"
import { cx } from "@/lib/format"

interface ChatSession {
  id: string
  userName: string
  userEmail: string
  lastMessage: string
  timestamp: Date
  unreadCount: number
  online: boolean
  avatar?: string
}

interface Message {
  id: string
  text: string
  sender: "admin" | "user"
  timestamp: Date
}

const MOCK_SESSIONS: ChatSession[] = [
  {
    id: "1",
    userName: "Siam Ahsan",
    userEmail: "siam@example.com",
    lastMessage: "I haven't received my order yet.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    unreadCount: 2,
    online: true,
  },
  {
    id: "2",
    userName: "Jannat Akter",
    userEmail: "jannat@example.com",
    lastMessage: "Thank you for the quick response!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    online: false,
  },
  {
    id: "3",
    userName: "Rakib Hasan",
    userEmail: "rakib@example.com",
    lastMessage: "Can I change my delivery address?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    online: true,
  }
]

export default function AdminChatPage() {
  const [activeSession, setActiveSession] = useState<ChatSession | null>(MOCK_SESSIONS[0])
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      { id: "m1", text: "Hello, how can I help you?", sender: "admin", timestamp: new Date(Date.now() - 1000 * 60 * 20) },
      { id: "m2", text: "I haven't received my order yet.", sender: "user", timestamp: new Date(Date.now() - 1000 * 60 * 10) },
    ]
  })
  const [inputText, setInputText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, activeSession])

  const handleSend = () => {
    if (!inputText.trim() || !activeSession) return

    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "admin",
      timestamp: new Date(),
    }

    setMessages(prev => ({
      ...prev,
      [activeSession.id]: [...(prev[activeSession.id] || []), newMsg]
    }))
    setInputText("")
  }

  const currentMessages = activeSession ? messages[activeSession.id] || [] : []

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {/* Sidebar - Sessions List */}
      <div className="flex w-80 flex-col border-r border-border bg-surface">
        <div className="p-4 border-b border-border bg-white">
          <h1 className="text-lg font-bold text-foreground mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              placeholder="Search chats..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {MOCK_SESSIONS.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session)}
              className={cx(
                "flex w-full items-center gap-3 p-4 transition-colors border-b border-border/50",
                activeSession?.id === session.id ? "bg-white shadow-sm" : "hover:bg-white/50"
              )}
            >
              <div className="relative shrink-0">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                  {session.userName[0]}
                </div>
                {session.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">{session.userName}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate line-clamp-1 italic">
                  {session.lastMessage}
                </p>
              </div>
              {session.unreadCount > 0 && (
                <div className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {session.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeSession ? (
        <div className="flex flex-1 flex-col bg-white">
          {/* Chat Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">
                  {activeSession.userName[0]}
                </div>
                {activeSession.online && (
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{activeSession.userName}</h2>
                <p className="text-[10px] text-muted-foreground">{activeSession.userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:bg-surface rounded-lg transition-colors"><Phone className="h-4 w-4" /></button>
              <button className="p-2 text-muted-foreground hover:bg-surface rounded-lg transition-colors"><Video className="h-4 w-4" /></button>
              <button className="p-2 text-muted-foreground hover:bg-surface rounded-lg transition-colors"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </header>

          {/* Messages List */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface/30"
          >
            {currentMessages.map((msg) => (
              <div 
                key={msg.id}
                className={cx(
                  "flex w-full",
                  msg.sender === "admin" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cx(
                  "max-w-[70%] space-y-1",
                  msg.sender === "admin" ? "items-end" : "items-start"
                )}>
                  <div className={cx(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all",
                    msg.sender === "admin" 
                      ? "rounded-tr-none bg-primary text-white" 
                      : "rounded-tl-none bg-white text-foreground border border-border/50"
                  )}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 px-1">
                    <p className="text-[10px] text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender === "admin" && <CheckCheck className="h-3 w-3 text-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <footer className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your reply..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </footer>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-surface/30 text-center p-8">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white shadow-sm border border-border mb-4">
            <MessageSquare className="h-10 w-10 text-primary/40" />
          </div>
          <h2 className="text-lg font-bold text-foreground">No Chat Selected</h2>
          <p className="text-sm text-muted-foreground max-w-xs mt-1">
            Choose a customer from the list on the left to start responding to their queries.
          </p>
        </div>
      )}
    </div>
  )
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
