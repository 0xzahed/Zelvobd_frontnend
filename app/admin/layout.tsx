import type { ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminDataProvider } from "@/lib/admin-store"
import { ConfirmProvider } from "@/components/ui/confirm-dialog"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminDataProvider>
      <ConfirmProvider>
        <AdminShell>{children}</AdminShell>
      </ConfirmProvider>
    </AdminDataProvider>
  )
}
