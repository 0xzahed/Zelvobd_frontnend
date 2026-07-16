"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, ImagePlus, X } from "lucide-react"
import type { CategoryBanner } from "@/lib/types"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { useCategories } from "@/src/hooks/api/useCategories"
import {
  useCategoryBanners,
  useCreateCategoryBanner,
  useUpdateCategoryBanner,
  useDeleteCategoryBanner,
} from "@/src/hooks/api/useCategoryBanners"
import { toAbsoluteUploadUrl } from "@/src/api/mainApi"
import { notify } from "@/lib/notify"
import { DashPage, DashHeader, DashPanel, DashLoading, DashEmptyState } from "@/dashboard/components/dash-ui"

type Draft = {
  id?: string
  title: string
  subTitle: string
  url: string
  imageUrl: string
  categoryId: string
}

const emptyDraft: Draft = { title: "", subTitle: "", url: "", imageUrl: "", categoryId: "" }

export default function DashboardCategoryBannersPage() {
  const { data: banners = [], isLoading } = useCategoryBanners()
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateCategoryBanner()
  const updateMutation = useUpdateCategoryBanner()
  const deleteMutation = useDeleteCategoryBanner()
  const confirm = useConfirm()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImagePick = (f: File | undefined) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      notify.error({ title: "Error", message: "Image must be less than 5MB" })
      return
    }
    setFile(f)
    setDraft({ ...draft, imageUrl: URL.createObjectURL(f) })
  }

  const openNew = () => {
    setDraft(emptyDraft)
    setFile(null)
    setEditing(false)
    setOpen(true)
  }

  const openEdit = (b: CategoryBanner) => {
    setDraft({
      id: b.id,
      title: b.title,
      subTitle: b.subTitle || "",
      url: b.url || "",
      imageUrl: b.imageUrl,
      categoryId: b.categoryId,
    })
    setFile(null)
    setEditing(true)
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.categoryId) return
    if (!editing && !file) {
      notify.error({ title: "Error", message: "Image is required" })
      return
    }

    const formData = new FormData()
    formData.append("title", draft.title.trim())
    formData.append("categoryId", draft.categoryId)
    if (draft.subTitle.trim()) formData.append("subTitle", draft.subTitle.trim())
    if (draft.url.trim()) formData.append("url", draft.url.trim())
    if (file) formData.append("image", file)

    if (editing && draft.id) {
      await updateMutation.mutateAsync({ id: draft.id, formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
  }

  const handleDelete = async (b: CategoryBanner) => {
    const ok = await confirm({
      title: `Delete "${b.title}"?`,
      message: "This banner will be permanently removed.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(b.id)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Category Banners" subtitle="Manage category banner images" />
        <DashLoading label="Loading banners..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader
        title="Category Banners"
        subtitle="Manage category banner images"
        actions={
          <button
            onClick={openNew}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        }
      />

      {banners.length === 0 ? (
        <DashEmptyState icon={ImagePlus} title="No banners found" description="Add a category banner to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {banners.map((b) => {
            const categoryName = categories.find((c) => c.id === b.categoryId)?.name || "Unknown"
            return (
              <div
                key={b.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-32 w-full overflow-hidden bg-muted">
                  <Image
                    src={toAbsoluteUploadUrl(b.imageUrl) || "/placeholder.svg"}
                    alt={b.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                  <div>
                    <p className="truncate text-sm font-semibold text-foreground">{b.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{categoryName}</p>
                    {b.subTitle && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground/70">{b.subTitle}</p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-primary hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      disabled={deleteMutation.isPending}
                      className="grid h-7 w-7 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
          >
            <div className="relative mb-5 border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold text-foreground">
                {editing ? "Edit Category Banner" : "Add New Category Banner"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Category</label>
                <select
                  value={draft.categoryId}
                  onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                  disabled={categories.length === 0}
                  className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Banner title"
                  className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Sub Title (Optional)</label>
                <input
                  value={draft.subTitle}
                  onChange={(e) => setDraft({ ...draft, subTitle: e.target.value })}
                  placeholder="Sub title"
                  className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Link (Optional)</label>
                <input
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://example.com"
                  className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImagePick(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex min-h-35 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-surface/50 transition hover:bg-surface"
                >
                  {draft.imageUrl ? (
                    <div className="flex flex-col items-center gap-2 p-4">
                      <Image
                        src={editing ? toAbsoluteUploadUrl(draft.imageUrl) || "/placeholder.svg" : draft.imageUrl}
                        alt="Preview"
                        width={200}
                        height={100}
                        className="max-h-28 rounded-md object-contain"
                        unoptimized
                      />
                      <span className="text-xs text-muted-foreground">Click to change image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ImagePlus className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium text-primary">Click to upload image</span>
                      <span className="text-xs text-muted-foreground">Max 5 MB</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!draft.title.trim() || !draft.categoryId || isPending}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {isPending ? "Submitting..." : editing ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashPage>
  )
}
