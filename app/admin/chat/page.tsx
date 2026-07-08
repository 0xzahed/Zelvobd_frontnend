"use client"

import { DashPage, DashHeader, DashPanel } from "@/dashboard/components/dash-ui"
import { MessageSquare } from "lucide-react"

export default function DashboardChatPage() {
  return (
    <DashPage>
      <DashHeader title="Live Chat" subtitle="Customer support chat" />
      <DashPanel>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-base font-medium text-foreground">Live chat</p>
          <p className="text-sm text-muted-foreground">This page will be configured soon.</p>
        </div>
      </DashPanel>
    </DashPage>
  )
}
