"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

export function NotificationBell() {
  const unread = 0
  return (
    <Link href="/notifications" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-[#EEF0FB]">
      <Bell className="h-5 w-5" />
      {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#FF3B3B] px-1 text-[10px] font-bold text-white">{unread}</span>}
    </Link>
  )
}
