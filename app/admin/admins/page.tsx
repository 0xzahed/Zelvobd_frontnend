"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react"
import { getAdmins } from "@/src/api/admin/getAdmins"
import { createAdmin } from "@/src/api/admin/createAdmin"
import { updateAdmin } from "@/src/api/admin/updateAdmin"
import { deleteAdmin } from "@/src/api/admin/deleteAdmin"
import { notify } from "@/lib/notify"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { AdminSelect } from "@/components/admin/admin-select"

type AdminRole = "Super Admin" | "Admin" | "Editor" | "Viewer"

type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  active: boolean
  createdAt: string
}

const ROLES: AdminRole[] = ["Super Admin", "Admin", "Editor", "Viewer"]

function useEscapeToClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])
}

type FormState = {
  id: string | null
  name: string
  email: string
  role: AdminRole
  password: string
  active: boolean
}

const emptyForm: FormState = {
  id: null,
  name: "",
  email: "",
  role: "Admin",
  password: "",
  active: true,
}

export default function AdminsPage() {
  const confirm = useConfirm()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEscapeToClose(open, () => setOpen(false))

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const res = await getAdmins()
      const list = Array.isArray(res?.data) ? res.data : []
      setAdmins(
        list.map((admin: { id: string; email: string; isActive: boolean; createdAt: string }) => ({
          id: admin.id,
          name: admin.email.split("@")[0] || "Admin",
          email: admin.email,
          role: "Admin",
          active: Boolean(admin.isActive),
          createdAt: String(admin.createdAt || "").slice(0, 10),
        })),
      )
    } catch (error) {
      notify.error({ title: "Failed to load admins", message: getErrorMessage(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdmins()
  }, [])

  const openAdd = () => {
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (a: AdminUser) => {
    setForm({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
      password: "",
      active: a.active,
    })
    setOpen(true)
  }

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    if (!form.id && !form.password.trim()) return

    try {
      setSaving(true)
      if (form.id) {
        const payload: { email: string; isActive: boolean; password?: string } = {
          email: form.email.trim(),
          isActive: form.active,
        }
        if (form.password.trim()) {
          payload.password = form.password.trim()
        }
        await updateAdmin(form.id, payload)
        notify.success({ title: "Admin updated", message: "Changes saved successfully." })
      } else {
        await createAdmin({
          email: form.email.trim(),
          password: form.password.trim(),
          isActive: form.active,
        })
        notify.success({ title: "Admin created", message: "New admin added successfully." })
      }
      await loadAdmins()
      setOpen(false)
    } catch (error) {
      notify.error({ title: "Save failed", message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    const target = admins.find((a) => a.id === id)
    const ok = await confirm({
      title: "Remove this admin?",
      message: target
        ? `Are you sure you want to remove "${target.email}"? This action cannot be undone.`
        : "Are you sure you want to remove this admin? This action cannot be undone.",
      confirmText: "Remove",
      variant: "danger",
    })
    if (ok) {
      try {
        await deleteAdmin(id)
        notify.success({ title: "Admin deleted", message: "Admin removed successfully." })
        await loadAdmins()
      } catch (error) {
        notify.error({ title: "Delete failed", message: getErrorMessage(error) })
      }
    }
  }

  const toggleActive = async (id: string) => {
    const target = admins.find((a) => a.id === id)
    if (!target) return
    try {
      await updateAdmin(id, { isActive: !target.active })
      await loadAdmins()
    } catch (error) {
      notify.error({ title: "Status update failed", message: getErrorMessage(error) })
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </p>
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Admins</h2>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#306FD7] px-4 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#F7F9FD] text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && admins.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-[#306FD7]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-[#EEF0FB] px-2 py-0.5 text-xs font-semibold text-[#306FD7]">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(a.id)}
                      className={
                        a.active
                          ? "inline-flex rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-xs font-semibold text-[#22C55E]"
                          : "inline-flex rounded-full bg-[#6B7280]/10 px-2 py-0.5 text-xs font-semibold text-[#6B7280]"
                      }
                    >
                      {a.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.createdAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        aria-label="Edit"
                        title="Edit"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        aria-label="Delete"
                        title="Delete"
                        disabled={a.role === "Super Admin"}
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#FF3B3B]/10 text-[#FF3B3B] disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No admins yet.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    Loading admins...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-base font-bold text-foreground">
                {form.id ? "Edit Admin" : "Add Admin"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#EEF0FB]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSave} className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-[#F7F9FD] px-3 py-2 text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-[#F7F9FD] px-3 py-2 text-sm"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Password {form.id && <span className="text-muted-foreground">(leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  required={!form.id}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-[#F7F9FD] px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Role</label>
                <AdminSelect
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="bg-[#F7F9FD]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Active
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-[#EEF0FB] px-4 py-2 text-sm font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#306FD7] px-4 py-2 text-sm font-semibold text-white"
                >
                  {saving ? "Saving..." : form.id ? "Save Changes" : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error
  }
  return "Please try again."
}
