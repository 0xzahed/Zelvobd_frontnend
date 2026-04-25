import type { ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminDataProvider } from "@/lib/admin-store"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  )
}
