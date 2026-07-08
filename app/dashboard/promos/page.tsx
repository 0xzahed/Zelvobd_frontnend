"use client"

import { useMemo, useState } from "react"
import { Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { notify } from "@/lib/notify"
import { Switch } from "@/components/ui/switch"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { usePromos, useCreatePromo, useUpdatePromo, useDeletePromo, type PromoCode, type CreatePromoPayload } from "@/src/hooks/api/usePromos"

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

export default function DashboardPromosPage() {
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
    if (ok) deleteMutation.mutate(p.id)
  }

  const handleToggle = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, isActive })
  }

  const openCreate = () => { setDraft(emptyDraft); setOpen(true) }

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
      updateMutation.mutate({ id: draft.id, ...payload }, { onSuccess: () => setOpen(false) })
    } else {
      createMutation.mutate(payload, { onSuccess: () => setOpen(false) })
    }
  }

  return (
    <DashPage>
      <DashHeader
        title="Promo Codes"
        subtitle={`${promos.length} total codes`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Promo
          </button>
        }
      />

      {/* Search */}
      <div className="flex h-10 max-w-xs items-center gap-2 rounded-lg border border-border/60 bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search promo codes..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <DashLoading label="Loading promo codes..." />
      ) : filtered.length === 0 ? (
        <DashPanel>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-base font-medium text-foreground">No promo codes found</p>
            <p className="text-sm text-muted-foreground">Click "Add Promo" to create your first promo code.</p>
          </div>
        </DashPanel>
      ) : (
        <DashPanel noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/50 text-muted-foreground">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Code</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Discount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Min Order</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Max Discount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Usage</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Active</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: PromoCode) => (
                  <tr key={p.id} className="border-b border-border/30 transition hover:bg-surface/50">
                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-sm font-bold text-foreground">{p.code}</span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {p.discountType === "PERCENT" ? `${p.discountValue}%` : `৳${p.discountValue}`}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {p.minOrderValue ? `৳${p.minOrderValue}` : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {p.maxDiscount ? `৳${p.maxDiscount}` : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{p.usageCount}</td>
                    <td className="px-5 py-3.5">
                      <Switch checked={p.isActive} onCheckedChange={(v) => handleToggle(p.id, v)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
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
        </DashPanel>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="relative mb-6 border-b border-border/40 pb-3 text-center">
              <h3 className="text-base font-bold text-foreground">{editing ? "Edit Promo Code" : "Add New Promo Code"}</h3>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</label>
                <input
                  type="text"
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                  placeholder="e.g., SUMMER20"
                  className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discount Type</label>
                  <select
                    value={draft.discountType}
                    onChange={(e) => setDraft({ ...draft, discountType: e.target.value as "PERCENT" | "AMOUNT" })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="AMOUNT">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={draft.discountValue || ""}
                    onChange={(e) => setDraft({ ...draft, discountValue: Number(e.target.value) })}
                    placeholder="e.g. 10"
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Order (৳)</label>
                  <input
                    type="number"
                    value={draft.minOrderValue || ""}
                    onChange={(e) => setDraft({ ...draft, minOrderValue: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional"
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Max Discount (৳)</label>
                  <input
                    type="number"
                    value={draft.maxDiscount || ""}
                    onChange={(e) => setDraft({ ...draft, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Optional"
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start Date</label>
                  <input
                    type="datetime-local"
                    value={draft.startDate || ""}
                    onChange={(e) => setDraft({ ...draft, startDate: e.target.value || null })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">End Date</label>
                  <input
                    type="datetime-local"
                    value={draft.endDate || ""}
                    onChange={(e) => setDraft({ ...draft, endDate: e.target.value || null })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Active
              </label>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashPage>
  )
}
