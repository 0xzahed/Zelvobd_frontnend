"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react"
import type { Slider } from "@/lib/types"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { AdminSelect } from "@/components/admin/admin-select"
import { notify } from "@/lib/notify"
import { useCategories } from "@/src/hooks/api/useCategories"
import {
  useBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
} from "@/src/hooks/api/useBanners"

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

export default function AdminSliders() {
  const { data: sliders = [], isLoading: isLoadingBanners } = useBanners()
  const { data: categories = [] } = useCategories()

  const createMutation = useCreateBanner()
  const updateMutation = useUpdateBanner()
  const deleteMutation = useDeleteBanner()

  const confirm = useConfirm()

  const handleDeleteSlider = async (s: Slider) => {
    const ok = await confirm({
      title: "Delete slider?",
      message: `Are you sure you want to delete${s.title ? ` "${s.title}"` : " this slider"}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(s.id)
  }

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const editing = Boolean(draft.id)

  const openCreate = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }

  const openEdit = (s: Slider & { categoryId?: string, inHomePage?: boolean }) => {
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
        {
          id: draft.id,
          title: draft.title,
          subtitle: draft.subtitle,
          url: draft.link,
          categoryId: draft.categoryId,
          image: draft.image,
          inHomePage: draft.inHomePage,
        },
        {
          onSuccess: () => {
            setOpen(false)
            setDraft(emptyDraft)
          },
        }
      )
    } else {
      createMutation.mutate(
        {
          title: draft.title,
          subtitle: draft.subtitle,
          url: draft.link,
          categoryId: draft.categoryId,
          image: draft.image,
          inHomePage: draft.inHomePage,
        },
        {
          onSuccess: () => {
            setOpen(false)
            setDraft(emptyDraft)
          },
        }
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h1 className="text-base text-foreground">Banner List</h1>
      </div>

      {/* Card */}
      <div className="rounded-lg bg-card p-4 shadow-card md:p-5">
        {/* Top bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm text-foreground">Banner List</h2>
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-primary px-4 text-sm text-primary transition hover:bg-primary hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-125">
          <div className="grid grid-cols-[90px_1fr_100px_120px] items-center gap-3 border-b border-border py-3 text-center text-xs text-muted-foreground">
            <div>Image</div>
            <div className="text-left pl-2">Title</div>
            <div>Home Page</div>
            <div>Action</div>
          </div>
          {isLoadingBanners ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading banners...
            </div>
          ) : sliders.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No banners added yet.
            </div>
          ) : (
            sliders.map((s: Slider & { categoryId?: string, inHomePage?: boolean }) => (
              <div
                key={s.id}
                className="grid grid-cols-[90px_1fr_100px_120px] items-center gap-3 border-b border-border py-3 text-center text-sm"
              >
                <div className="flex justify-center">
                  <div className="relative h-14 w-14 overflow-hidden rounded-md bg-surface">
                    {s.image ? (
                      <Image
                        src={s.image || "/placeholder.svg"}
                        alt={s.title || "Banner"}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: s.bg || "var(--primary)" }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-foreground text-left pl-2">
                  <div className="font-medium">{s.title || "Untitled"}</div>
                  {s.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</div>}
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-tight ${
                      s.inHomePage
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.inHomePage ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEdit(s)}
                    aria-label="Edit"
                    className="text-primary transition hover:opacity-80"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlider(s)}
                    aria-label="Delete"
                    className="text-destructive transition hover:opacity-80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="relative mb-6 border-b border-border pb-3 text-center">
              <h3 className="text-base text-foreground">
                {editing ? "Edit Banner" : "Add New Banner"}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <AdminSelect
                  value={draft.categoryId}
                  onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                  disabled={categories.length === 0}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </AdminSelect>
              </div>

              {/* Title */}
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary"
                required
              />

              {/* Subtitle */}
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                placeholder="Sub Title (Optional)"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary"
              />

              {/* Link */}
              <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={draft.link}
                  onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                  placeholder="Enter Link"
                  className="h-full w-full bg-transparent text-sm outline-none"
                />
              </div>

              {/* In Home Page Checkbox */}
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.inHomePage}
                  onChange={(e) => setDraft({ ...draft, inHomePage: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Show on Home Page
              </label>

              {/* Image Upload */}
              <div>
                <p className="mb-2 text-sm text-foreground">Image Upload</p>
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImagePick(e.target.files?.[0])}
                  />
                  <div className="relative grid min-h-35 place-items-center rounded-md border-2 border-dashed border-primary bg-secondary/60 p-4 transition hover:bg-secondary">
                    {draft.image ? (
                      <div className="relative h-full w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.image || "/placeholder.svg"}
                          alt="Preview"
                          className="mx-auto max-h-36 rounded-md object-contain"
                        />
                        <span className="mt-2 block text-center text-[11px] text-muted-foreground">
                          Click to change image
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ImagePlus className="h-6 w-6 text-primary" />
                        <span className="text-sm text-primary">
                          Click to upload image
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Max image size 5 MB
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex h-10 min-w-30 items-center justify-center rounded-md bg-primary px-6 text-sm text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
