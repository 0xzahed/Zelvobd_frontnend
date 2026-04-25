"use client"

import { useEffect, useState } from "react"
import { Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react"

type AdminRole = "Super Admin" | "Admin" | "Editor" | "Viewer"

type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  active: boolean
  createdAt: string
}

const SEED: AdminUser[] = [
  {
    id: "a1",
    name: "Main Admin",
    email: "admin@shophub.com",
    role: "Super Admin",
    active: true,
    createdAt: "2025-01-10",
  },
]

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
  const [admins, setAdmins] = useState<AdminUser[]>(SEED)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEscapeToClose(open, () => setOpen(false))

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

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    if (!form.id && !form.password.trim()) return

    if (form.id) {
      setAdmins((list) =>
        list.map((a) =>
          a.id === form.id
            ? { ...a, name: form.name, email: form.email, role: form.role, active: form.active }
            : a,
        ),
      )
    } else {
      const created: AdminUser = {
        id: `a-${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setAdmins((list) => [created, ...list])
    }
    setOpen(false)
  }

  const onDelete = (id: string) => {
    if (confirm("Remove this admin?")) {
      setAdmins((list) => list.filter((a) => a.id !== id))
    }
  }

  const toggleActive = (id: string) => {
    setAdmins((list) => list.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
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
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#3B6CF4] px-4 text-sm font-semibold text-white"
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
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-[#3B6CF4]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-[#EEF0FB] px-2 py-0.5 text-xs font-semibold text-[#3B6CF4]">
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
              {admins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No admins yet.
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
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminRole }))}
                  className="w-full rounded-lg border border-border bg-[#F7F9FD] px-3 py-2 text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  className="rounded-full bg-[#3B6CF4] px-4 py-2 text-sm font-semibold text-white"
                >
                  {form.id ? "Save Changes" : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
