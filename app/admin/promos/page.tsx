"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Trash2, X } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { notify } from "@/lib/notify"
import { Switch } from "@/components/ui/switch"
import {
  AdminPage,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/admin-ui"
import {
  usePromos,
  useCreatePromo,
  useUpdatePromo,
  useDeletePromo,
  type PromoCode,
  type PromoDiscountType,
  type CreatePromoPayload,
} from "@/src/hooks/api/usePromos"

const emptyDraft: CreatePromoPayload = {
  code: "",
  discountType: "PERCENT",
  discountValue: 0,
  minOrderValue: null,
  maxDiscount: null,
  startDate: null,
  endDate: null,
  isActive: true,
}

export default function AdminPromosPage() {
  const { data: promos = [], isLoading } = usePromos()
  const createMutation = useCreatePromo()
  const updateMutation = useUpdatePromo()
  const deleteMutation = useDeletePromo()
  const confirm = useConfirm()

  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CreatePromoPayload & { id?: string }>(emptyDraft)
  const editing = Boolean(draft.id)

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim()
    if (!lc) return promos
    return promos.filter((p: PromoCode) => p.code.toLowerCase().includes(lc))
  }, [promos, q])

  const handleDelete = async (p: PromoCode) => {
    const ok = await confirm({
      title: "Delete Promo Code?",
      message: `Are you sure you want to delete "${p.code}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) {
      deleteMutation.mutate(p.id)
    }
  }

  const handleToggle = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, isActive })
  }

  const openCreate = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }

  const openEdit = (p: PromoCode) => {
    setDraft({
      id: p.id,
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderValue: p.minOrderValue,
      maxDiscount: p.maxDiscount,
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 16) : null,
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 16) : null,
      isActive: p.isActive,
    })
    setOpen(true)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!draft.code || draft.discountValue <= 0) {
      notify.error({ title: "Validation Error", message: "Code and a positive discount value are required." })
      return
    }

    const payload: any = {
      code: draft.code,
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue),
      minOrderValue: draft.minOrderValue ? Number(draft.minOrderValue) : null,
      maxDiscount: draft.maxDiscount ? Number(draft.maxDiscount) : null,
      startDate: draft.startDate ? new Date(draft.startDate).toISOString() : null,
      endDate: draft.endDate ? new Date(draft.endDate).toISOString() : null,
      isActive: draft.isActive,
    }

    if (editing && draft.id) {
      updateMutation.mutate(
        { id: draft.id, ...payload },
        { onSuccess: () => setOpen(false) }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Promo Codes"
        count={`${promos.length} total`}
        actions={
          <AdminToolbar>
            <AdminSearchInput
              value={q}
              onChange={setQ}
              placeholder="Search code..."
              className="md:w-64"
            />
            <AdminPrimaryButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add
            </AdminPrimaryButton>
          </AdminToolbar>
        }
      />

      <div className="space-y-3 md:hidden">
        {isLoading && (
          <div className="rounded-[10px] border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
            Loading promos...
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[10px] border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
            No promo codes found.
          </div>
        )}
        {!isLoading &&
          filtered.map((p: PromoCode) => (
            <div key={p.id} className="rounded-[10px] border border-border/60 bg-card p-2.5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="text-sm font-semibold text-foreground">{p.code}</p>
                </div>
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {p.discountType === "PERCENT" ? `${p.discountValue}%` : `৳${p.discountValue}`}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Usage</span>
                  <span className="text-foreground">{p.usageCount} times</span>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Constraints</p>
                  <div className="space-y-0.5">
                    {p.minOrderValue && <div>Min: ৳{p.minOrderValue}</div>}
                    {p.maxDiscount && <div>Max: ৳{p.maxDiscount}</div>}
                    {p.startDate && <div>From: {new Date(p.startDate).toLocaleDateString()}</div>}
                    {p.endDate && <div>To: {new Date(p.endDate).toLocaleDateString()}</div>}
                    {!p.minOrderValue && !p.maxDiscount && !p.startDate && !p.endDate && (
                      <span>None</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active</span>
                  <Switch
                    checked={p.isActive}
                    onCheckedChange={(val) => handleToggle(p.id, val)}
                    disabled={updateMutation.isPending && updateMutation.variables?.id === p.id}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => openEdit(p)}
                  aria-label="Edit"
                  className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-primary hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deleteMutation.isPending}
                  aria-label="Delete"
                  className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="hidden overflow-hidden rounded-[10px] border border-border/60 bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-245 text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Constraints</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Active</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    Loading promos...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No promo codes found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((p: PromoCode) => (
                  <tr key={p.id} className="border-b border-border/60 transition hover:bg-secondary/50 last:border-b-0">
                    <td className="px-5 py-3">
                      <span className="font-bold tracking-wide text-foreground">{p.code}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        {p.discountType === "PERCENT" ? `${p.discountValue}%` : `৳${p.discountValue}`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {p.minOrderValue && <div>Min: ৳{p.minOrderValue}</div>}
                      {p.maxDiscount && <div>Max: ৳{p.maxDiscount}</div>}
                      {p.startDate && <div>From: {new Date(p.startDate).toLocaleDateString()}</div>}
                      {p.endDate && <div>To: {new Date(p.endDate).toLocaleDateString()}</div>}
                      {!p.minOrderValue && !p.maxDiscount && !p.startDate && !p.endDate && (
                        <span>None</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.usageCount} times</td>
                    <td className="px-5 py-3">
                      <Switch
                        checked={p.isActive}
                        onCheckedChange={(val) => handleToggle(p.id, val)}
                        disabled={updateMutation.isPending && updateMutation.variables?.id === p.id}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label="Edit"
                          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground transition hover:bg-primary hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleteMutation.isPending}
                          aria-label="Delete"
                          className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="relative mb-5 border-b border-border pb-3 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                {editing ? "Edit Promo Code" : "Create Promo Code"}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute right-0 top-0 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Code *</span>
                  <input
                    value={draft.code}
                    onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER20"
                    required
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Discount Type *</span>
                  <select
                    value={draft.discountType}
                    onChange={(e) => setDraft({ ...draft, discountType: e.target.value as PromoDiscountType })}
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  >
                    <option value="PERCENT">Percent (%)</option>
                    <option value="AMOUNT">Fixed Amount (৳)</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Discount Value *</span>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={draft.discountValue || ""}
                    onChange={(e) => setDraft({ ...draft, discountValue: Number(e.target.value) })}
                    placeholder="e.g. 20"
                    required
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Min Order Value (৳)</span>
                  <input
                    type="number"
                    min={0}
                    value={draft.minOrderValue || ""}
                    onChange={(e) => setDraft({ ...draft, minOrderValue: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional"
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-foreground">Max Discount Limit (৳)</span>
                <input
                  type="number"
                  min={0}
                  value={draft.maxDiscount || ""}
                  onChange={(e) => setDraft({ ...draft, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Optional limit for percent discounts"
                  className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Start Date</span>
                  <input
                    type="datetime-local"
                    value={draft.startDate || ""}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value || null })}
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">End Date</span>
                  <input
                    type="datetime-local"
                    value={draft.endDate || ""}
                    onChange={(e) => setDraft({ ...draft, endDate: e.target.value || null })}
                    className="h-10 w-full rounded-md border border-border bg-transparent px-3 outline-none focus:border-primary"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 pt-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Active (Users can apply this code)
              </label>

              <div className="mt-4 flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Promo"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  )
}
