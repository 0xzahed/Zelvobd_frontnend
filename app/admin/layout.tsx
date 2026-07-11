import type { ReactNode } from "react"
import { ConfirmProvider } from "@/components/ui/confirm-dialog"
import { DashboardShell } from "@/dashboard/components/dashboard-shell"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <DashboardShell>{children}</DashboardShell>
    </ConfirmProvider>
  )
}
