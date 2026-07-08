"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CalendarDays, Clock, Edit, ImagePlus, MoreVertical, Plus, Tag, Trash } from "lucide-react"
import { format } from "date-fns"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { useFlashSales, useCreateFlashSale, useUpdateFlashSaleCampaign, useDeleteFlashSale } from "@/src/hooks/api/useFlashSales"
import { toAbsoluteUploadUrl } from "@/src/api/mainApi"
import { useConfirm } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type FormState = {
  title: string
  startAt: string
  endAt: string
  discountType: "PERCENT" | "TAKA"
  discountValue: string
}

export default function DashboardFlashSalePage() {
  const { data, isLoading } = useFlashSales(1, 100)
  const campaigns = data?.campaigns || []
  const createMutation = useCreateFlashSale()
  const updateMutation = useUpdateFlashSaleCampaign()
  const deleteMutation = useDeleteFlashSale()
  const confirm = useConfirm()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [image, setImage] = useState("")
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<FormState>({
    title: "",
    startAt: "",
    endAt: "",
    discountType: "PERCENT",
    discountValue: "",
  })

  const pickImage = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setFormData({ title: "", startAt: "", endAt: "", discountType: "PERCENT", discountValue: "" })
    setImage("")
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (campaign: any) => {
    setEditingId(campaign.id)
    setFormData({
      title: campaign.title,
      startAt: new Date(campaign.startAt).toISOString().slice(0, 16),
      endAt: new Date(campaign.endAt).toISOString().slice(0, 16),
      discountType: campaign.discountType,
      discountValue: String(campaign.discountValue),
    })
    setImage(campaign.bannerUrl || "")
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.startAt || !formData.endAt) return

    const payload = {
      title: formData.title,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: new Date(formData.endAt).toISOString(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      productIds: [],
    }

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        payload: { ...payload, bannerUrl: image || undefined },
      })
    } else {
      await createMutation.mutateAsync({
        ...payload,
        bannerUrl: image || undefined,
      })
    }

    setModalOpen(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Flash Sale",
      message: "Are you sure you want to delete this campaign? This will remove the discount from all associated products. This action cannot be undone.",
      confirmText: "Delete Campaign",
      variant: "danger",
    })
    if (confirmed) await deleteMutation.mutateAsync(id)
  }

  return (
    <DashPage>
      <DashHeader
        title="Flash Sales"
        subtitle={`${campaigns.length} total campaigns`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Campaign
          </button>
        }
      />

      {isLoading ? (
        <DashLoading label="Loading campaigns..." />
      ) : campaigns.length === 0 ? (
        <DashPanel>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Tag className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-base font-medium text-foreground">No flash sales created yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Campaign" to create your first flash sale.</p>
          </div>
        </DashPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group rounded-xl border border-border/40 bg-card p-4 transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {campaign.bannerUrl && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <img
                          src={toAbsoluteUploadUrl(campaign.bannerUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground" title={campaign.title}>
                        {campaign.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant={campaign.status === "ACTIVE" ? "default" : campaign.status === "SCHEDULED" ? "secondary" : "outline"}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                          {campaign.discountType === "PERCENT" ? `${campaign.discountValue}% OFF` : `৳${campaign.discountValue} OFF`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(campaign)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/flash-sale/${campaign.id}`} className="cursor-pointer">
                        <Tag className="mr-2 h-4 w-4" /> Manage Products
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                  <span>{format(new Date(campaign.startAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 opacity-70" />
                  <span>{format(new Date(campaign.endAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-border/30 pt-2">
                  <span className="font-bold text-foreground">{campaign.productCount}</span>
                  <span>products selected</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => { setModalOpen(false); resetForm() }}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="relative mb-6 border-b border-border/40 pb-3 text-center">
              <h3 className="text-base font-bold text-foreground">{editingId ? "Edit Flash Sale" : "Create Flash Sale"}</h3>
              <button type="button" aria-label="Close" onClick={() => { setModalOpen(false); resetForm() }} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <span className="text-lg">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Eid Special Flash Sale"
                  className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "PERCENT" | "TAKA" })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="TAKA">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="e.g. 10"
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Banner Image (Optional)</label>
                <input ref={imgInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
                <button type="button" onClick={() => imgInputRef.current?.click()} className="flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-secondary/30 py-3 text-center transition hover:bg-secondary">
                  {image ? (
                    <img src={image} alt="Preview" className="max-h-16 rounded object-contain" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5 text-primary" />
                      <span className="text-sm text-primary">Upload banner image</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm() }}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashPage>
  )
}
