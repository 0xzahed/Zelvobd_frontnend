"use client"

import { useMemo, useState } from "react"
import { Plus, ShieldCheck, Trash2, EyeOff, Eye } from "lucide-react"
import type { Admin } from "@/lib/types"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { useAdmins, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from "@/src/hooks/api/useAdmins"
import { DashPage, DashHeader, DashPanel, DashLoading, DashEmptyState } from "@/dashboard/components/dash-ui"
export default function DashboardAdminsPage() {
  const { data: admins = [], isLoading } = useAdmins()
  const createMutation = useCreateAdmin()
  const updateMutation = useUpdateAdmin()
  const deleteMutation = useDeleteAdmin()
  const confirm = useConfirm()

  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const openCreate = () => {
    setEditingAdmin(null)
    setEmail("")
    setPassword("")
    setIsActive(true)
    setShowModal(true)
  }

  const openEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setEmail(admin.email)
    setPassword("")
    setIsActive(admin.isActive)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (editingAdmin) {
      const body: { email: string; password?: string; isActive: boolean } = { email, isActive }
      if (password.trim()) body.password = password.trim()
      await updateMutation.mutateAsync({ id: editingAdmin.id, ...body })
    } else {
      if (!password.trim()) return
      await createMutation.mutateAsync({ email, password: password.trim() })
    }
    setShowModal(false)
  }

  const handleDelete = async (admin: Admin) => {
    const ok = await confirm({
      title: "Delete Admin",
      message: `Are you sure you want to delete admin "${admin.email}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(admin.id)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Admins" subtitle="Manage admin users" />
        <DashLoading label="Loading admins..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader
        title="Admins"
        subtitle="Manage admin users"
        actions={
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        }
      />

      {admins.length === 0 ? (
        <DashEmptyState icon={ShieldCheck} title="No admins found" description="Add your first admin user to get started." />
      ) : (
        <DashPanel noPadding>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/50 text-muted-foreground">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Created</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Updated</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border/30 transition hover:bg-surface/50">
                    <td className="px-5 py-3.5 font-medium text-foreground">{admin.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                          admin.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{new Date(admin.updatedAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(admin)}
                          className="grid h-8 w-8 place-items-center rounded-md text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          disabled={deleteMutation.isPending}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border/30 md:hidden">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-sm">{admin.email}</span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      admin.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created: {new Date(admin.createdAt).toLocaleDateString("en-GB")}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated: {new Date(admin.updatedAt).toLocaleDateString("en-GB")}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(admin)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(admin)}
                      disabled={deleteMutation.isPending}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashPanel>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">{editingAdmin ? "Edit Admin" : "Add Admin"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editingAdmin ? "Update admin user details." : "Create a new admin user."}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@example.com"
                  className="h-10 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Password {editingAdmin && <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder={editingAdmin ? "New password..." : "Min 8 characters"}
                    className="h-10 w-full rounded-lg border border-border/60 bg-surface pr-10 pl-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                  style={{ backgroundColor: isActive ? "#22c55e" : "#d1d5db" }}
                  onClick={() => setIsActive((p) => !p)}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${isActive ? "translate-x-5.5" : "translate-x-0.5"}`} />
                </div>
                <label className="text-sm text-foreground cursor-pointer select-none" onClick={() => setIsActive((p) => !p)}>Active</label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!email.trim() || (!editingAdmin && !password.trim()) || isPending}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
              >
                {isPending ? "Saving..." : editingAdmin ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashPage>
  )
}
