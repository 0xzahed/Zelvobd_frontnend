"use client"

import { DashPage, DashHeader, DashPanel } from "@/dashboard/components/dash-ui"
import { Users } from "lucide-react"

export default function DashboardCustomersPage() {
  return (
    <DashPage>
      <DashHeader title="Customers" subtitle="Manage your customers" />
      <DashPanel>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-base font-medium text-foreground">Customer management</p>
          <p className="text-sm text-muted-foreground">This page will be configured soon.</p>
        </div>
      </DashPanel>
    </DashPage>
  )
}
