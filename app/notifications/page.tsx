"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import type { Notification } from "@/lib/types"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const markAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })))

  return <AppShell><BackHeader title="Notifications" right={<button onClick={markAll} aria-label="Mark all as read" className="grid h-10 w-10 place-items-center rounded-full bg-card text-[#3B6CF4] shadow-card"><Bell className="h-4 w-4" /></button>} /><div className="space-y-2 py-4 md:py-6">{items.length===0?<div className="rounded-2xl bg-card p-10 text-center text-sm text-muted-foreground">No notifications available.</div>:null}</div></AppShell>
}
