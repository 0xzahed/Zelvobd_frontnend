"use client"

import { useState } from "react"
import { Bell, Send } from "lucide-react"
import type { Notification } from "@/lib/types"

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Notification["type"]>("promo")

  function send() { if (!title.trim()) return; const next: Notification = { id: `n${Date.now()}`, type, title, description, time: "Just now", unread: true }; setItems([next, ...items]); setTitle(""); setDescription("") }

  return <div className="space-y-6"><header><h1 className="text-2xl font-semibold text-foreground">Notifications</h1></header><section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card"><div className="grid gap-4 md:grid-cols-2"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-11 rounded-xl border border-border bg-background px-3 text-sm" /><select value={type} onChange={(e) => setType(e.target.value as Notification["type"])} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="promo">Promo</option><option value="order">Order</option><option value="success">Success</option><option value="info">Info</option><option value="alert">Alert</option></select><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className="rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2" /></div><div className="mt-4 flex justify-end"><button onClick={send} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card"><Send className="h-4 w-4" /> Send</button></div></section><section className="rounded-2xl border border-border/70 bg-card p-2 shadow-card"><ul className="divide-y divide-border/60">{items.map((n) => <li key={n.id} className="flex items-start gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div><div className="flex-1"><p className="text-sm font-semibold text-foreground">{n.title}</p><p className="text-xs text-muted-foreground">{n.description}</p></div></li>)}{items.length===0?<li className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</li>:null}</ul></section></div>
}
