"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { Slider } from "@/lib/types"
import { useConfirm } from "@/components/ui/confirm-dialog"

type Draft = {
  id?: string
  title: string
  link: string
  image: string
}

const emptyDraft: Draft = { title: "", link: "", image: "" }

export default function AdminSliders() {
  const { sliders, addSlider, updateSlider, deleteSlider } = useAdminStore()
  const confirm = useConfirm()

  const handleDeleteSlider = async (s: Slider) => {
    const ok = await confirm({
      title: "Delete slider?",
      message: `Are you sure you want to delete${s.title ? ` "${s.title}"` : " this slider"}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) deleteSlider(s.id)
  }

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const editing = Boolean(draft.id)

  const openCreate = () => {
    setDraft(emptyDraft)
    setOpen(true)
  }

  const openEdit = (s: Slider) => {
    setDraft({
      id: s.id,
      title: s.title || "",
      link: s.link || "",
      image: typeof s.image === "string" ? s.image : "",
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
    if (editing && draft.id) {
      updateSlider(draft.id, {
        title: draft.title,
        link: draft.link,
        image: draft.image || undefined,
      })
    } else {
      const newSlider: Slider = {
        id: `slider-${Date.now()}`,
        title: draft.title,
        subtitle: "",
        cta: "Shop Now",
        link: draft.link,
        image: draft.image || "/placeholder.svg",
        bg: "#306FD7",
      }
      addSlider(newSlider)
    }
    setOpen(false)
    setDraft(emptyDraft)
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
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#306FD7] px-4 text-sm text-[#306FD7] transition hover:bg-[#306FD7] hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
          <div className="grid grid-cols-[90px_1fr_120px] items-center gap-3 border-b border-border py-3 text-center text-xs text-muted-foreground">
            <div>Image</div>
            <div>Title</div>
            <div>Action</div>
          </div>
          {sliders.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No banners added yet.
            </div>
          ) : (
            sliders.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-[90px_1fr_120px] items-center gap-3 border-b border-border py-3 text-center text-sm"
              >
                <div className="flex justify-center">
                  <div className="relative h-14 w-14 overflow-hidden rounded-md bg-[#F5F6FA]">
                    {s.image ? (
                      <Image
                        src={s.image || "/placeholder.svg"}
                        alt={s.title || "Banner"}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: s.bg || "#306FD7" }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-foreground">{s.title || "Untitled"}</div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEdit(s)}
                    aria-label="Edit"
                    className="text-[#306FD7] transition hover:opacity-80"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlider(s)}
                    aria-label="Delete"
                    className="text-[#E14949] transition hover:opacity-80"
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
              {/* Title */}
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Title"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-[#306FD7]"
                required
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
                  <div className="relative grid min-h-[140px] place-items-center rounded-md border-2 border-dashed border-[#306FD7] bg-[#EEF0FB]/60 p-4 transition hover:bg-[#EEF0FB]">
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
                        <ImagePlus className="h-6 w-6 text-[#306FD7]" />
                        <span className="text-sm text-[#306FD7]">
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
                  className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-md bg-[#306FD7] px-6 text-sm text-white transition hover:bg-[#2E55C9]"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
