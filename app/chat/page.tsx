"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Bot, MoreVertical, Phone, Video, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { cx } from "@/lib/format"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi there! Welcome to EcoMerce Support. How can we help you today?",
      sender: "bot",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText("")
    
    // Simulate bot response
    setIsTyping(true)
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (text: string) => {
    const input = text.toLowerCase()
    if (input.includes("delivery")) return "Orders inside Dhaka take 1-2 days. Outside Dhaka takes 2-4 days. You can track your order in the Orders section!"
    if (input.includes("return") || input.includes("refund")) return "We have a 7-day return policy for most unused items. Please keep the original packaging."
    if (input.includes("payment") || input.includes("bkash")) return "We accept bKash, Nagad, Cards, and Cash on Delivery for most areas."
    if (input.includes("offer") || input.includes("discount")) return "Check our 'Offers' page for the latest deals and flash sales!"
    return "Thanks for reaching out! One of our agents will be with you shortly to assist further."
  }

  return (
    <div className="flex h-dvh flex-col bg-card lg:mx-auto lg:max-w-2xl lg:border-x lg:border-border">
      {/* Custom Header for Chat */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border/50 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground active:scale-90 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">EcoMerce Support</h1>
              <p className="text-[10px] font-medium text-emerald-600">Always active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><Phone className="h-4 w-4" /></button>
          <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><Video className="h-4 w-4" /></button>
          <button className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"><MoreVertical className="h-4 w-4" /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <div className="mb-6 flex justify-center">
          <span className="rounded-full bg-secondary/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cx(
              "flex w-full",
              msg.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className={cx(
              "max-w-[80%] space-y-1",
              msg.sender === "user" ? "items-end" : "items-start"
            )}>
              <div className={cx(
                "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.sender === "user" 
                  ? "rounded-tr-none bg-primary text-white" 
                  : "rounded-tl-none bg-white text-foreground border border-border/50"
              )}>
                {msg.text}
              </div>
              <p className="px-1 text-[10px] text-muted-foreground">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-none bg-white border border-border/50 px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="border-t border-border/50 bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="w-full rounded-2xl border border-border bg-secondary/30 py-3 pl-4 pr-12 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            />
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary p-2 text-white shadow-md shadow-primary/20 active:scale-95 transition-transform"
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Powered by EcoMerce Smart Support
        </p>
      </footer>
    </div>
  )
}
