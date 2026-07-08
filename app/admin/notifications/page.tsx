"use client"

import { DashPage, DashHeader, DashPanel } from "@/dashboard/components/dash-ui"
import { Bell } from "lucide-react"

export default function DashboardNotificationsPage() {
  return (
    <DashPage>
      <DashHeader title="Notifications" subtitle="View system notifications" />
      <DashPanel>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-base font-medium text-foreground">No new notifications</p>
          <p className="text-sm text-muted-foreground">All caught up!</p>
        </div>
      </DashPanel>
    </DashPage>
  )
}
