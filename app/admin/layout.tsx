import type { ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { ConfirmProvider } from "@/components/ui/confirm-dialog"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <AdminShell>{children}</AdminShell>
    </ConfirmProvider>
  )
}
