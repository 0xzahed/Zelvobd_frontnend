"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react"
import type { Slider } from "@/lib/types"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { notify } from "@/lib/notify"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { useCategories } from "@/src/hooks/api/useCategories"
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from "@/src/hooks/api/useBanners"

type Draft = {
  id?: string
  title: string
  subtitle: string
  link: string
  image: string
  categoryId: string
  inHomePage: boolean
}

const emptyDraft: Draft = { title: "", subtitle: "", link: "", image: "", categoryId: "", inHomePage: true }

export default function DashboardSlidersPage() {
  const { data: sliders = [], isLoading } = useBanners()
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateBanner()
  const updateMutation = useUpdateBanner()
  const deleteMutation = useDeleteBanner()
  const confirm = useConfirm()

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const editing = Boolean(draft.id)

  const handleDelete = async (s: Slider & { categoryId?: string; inHomePage?: boolean }) => {
    const ok = await confirm({
      title: "Delete banner?",
      message: `Are you sure you want to delete${s.title ? ` "${s.title}"` : " this banner"}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(s.id)
  }

  const openCreate = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }

  const openEdit = (s: Slider & { categoryId?: string; inHomePage?: boolean }) => {
    setDraft({
      id: s.id,
      title: s.title || "",
      subtitle: s.subtitle || "",
      link: s.link || "",
      image: typeof s.image === "string" ? s.image : "",
      categoryId: s.categoryId || "",
      inHomePage: s.inHomePage ?? true,
    })
    setOpen(true)
  }

  const handleImagePick = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result ?? "") }))
    reader.readAsDataURL(file)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.categoryId) {
      notify.error({ title: "Validation Error", message: "Please select a category." })
      return
    }
    if (!editing && !draft.image) {
      notify.error({ title: "Validation Error", message: "Please upload an image." })
      return
    }
    if (editing && draft.id) {
      updateMutation.mutate(
        { id: draft.id, title: draft.title, subtitle: draft.subtitle, url: draft.link, categoryId: draft.categoryId, image: draft.image, inHomePage: draft.inHomePage },
        { onSuccess: () => { setOpen(false); setDraft(emptyDraft) } }
      )
    } else {
      createMutation.mutate(
        { title: draft.title, subtitle: draft.subtitle, url: draft.link, categoryId: draft.categoryId, image: draft.image, inHomePage: draft.inHomePage },
        { onSuccess: () => { setOpen(false); setDraft(emptyDraft) } }
      )
    }
  }

  return (
    <DashPage>
      <DashHeader
        title="Banners"
        subtitle={`${sliders.length} total banners`}
        actions={
          <button
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Banner
          </button>
        }
      />

      {isLoading ? (
        <DashLoading label="Loading banners..." />
      ) : sliders.length === 0 ? (
        <DashPanel>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-base font-medium text-foreground">No banners added yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Banner" to create your first banner.</p>
          </div>
        </DashPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sliders.map((s: Slider & { categoryId?: string; inHomePage?: boolean }) => (
            <div
              key={s.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="relative h-32 w-full overflow-hidden bg-surface">
                {s.image ? (
                  <Image src={s.image || "/placeholder.svg"} alt={s.title || "Banner"} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: s.bg || "var(--primary)" }} />
                )}
                <div className="absolute right-2 top-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.inHomePage ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {s.inHomePage ? "Home" : "Hidden"}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <p className="truncate text-sm font-semibold text-foreground">{s.title || "Untitled"}</p>
                {s.subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.subtitle}</p>}
                {s.link && (
                  <a href={s.link} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <Link2 className="h-3 w-3" />
                    <span className="truncate">{s.link}</span>
                  </a>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="flex h-8 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="relative mb-6 border-b border-border/40 pb-3 text-center">
              <h3 className="text-base font-bold text-foreground">{editing ? "Edit Banner" : "Add New Banner"}</h3>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <select
                value={draft.categoryId}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                disabled={categories.length === 0}
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 disabled:opacity-50"
              >
                <option value="">Select Category...</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                required
              />

              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                placeholder="Sub Title (Optional)"
                className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
              />

              <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-card px-3">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={draft.link}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                  placeholder="Enter Link"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.inHomePage}
                  onChange={(e) => setDraft({ ...draft, inHomePage: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Show on Home Page
              </label>

              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Image Upload</p>
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImagePick(e.target.files?.[0])} />
                  <div className="grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-primary/40 bg-secondary/30 p-4 transition hover:bg-secondary">
                    {draft.image ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={draft.image || "/placeholder.svg"} alt="Preview" className="mx-auto max-h-32 rounded-lg object-contain" />
                        <span className="mt-2 block text-center text-[11px] text-muted-foreground">Click to change image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ImagePlus className="h-6 w-6 text-primary" />
                        <span className="text-sm text-primary">Click to upload image</span>
                        <span className="text-[11px] text-muted-foreground">Max image size 5 MB</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

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
