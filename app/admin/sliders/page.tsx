"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePlus, Link2, Pencil, Plus, Trash2, X } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { Slider } from "@/lib/types"

type Draft = {
  id?: string
  title: string
  link: string
  image: string
}

const emptyDraft: Draft = { title: "", link: "", image: "" }

export default function AdminSliders() {
  const { sliders, addSlider, updateSlider, deleteSlider } = useAdminStore()

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
        bg: "#3B6CF4",
      }
      addSlider(newSlider)
    }
    setOpen(false)
    setDraft(emptyDraft)
  }

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h1 className="text-base text-foreground">Banner List</h1>
      </div>

      {/* Card */}
      <div className="rounded-lg bg-card p-5 shadow-card">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm text-foreground">Banner List</h2>
          <button
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#3B6CF4] px-4 text-sm text-[#3B6CF4] transition hover:bg-[#3B6CF4] hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-3 border-b border-border py-3 text-center text-xs text-muted-foreground">
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
                className="grid grid-cols-[1fr_2fr_1fr] items-center gap-3 border-b border-border py-3 text-center text-sm"
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
                        style={{ backgroundColor: s.bg || "#3B6CF4" }}
                      />
                    )}
                  </div>
                </div>
                <div className="text-foreground">{s.title || "Untitled"}</div>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEdit(s)}
                    aria-label="Edit"
                    className="text-[#3B6CF4] transition hover:opacity-80"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSlider(s.id)}
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
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-[#3B6CF4]"
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
                  <div className="relative grid min-h-[140px] place-items-center rounded-md border-2 border-dashed border-[#3B6CF4] bg-[#EEF0FB]/60 p-4 transition hover:bg-[#EEF0FB]">
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
                        <ImagePlus className="h-6 w-6 text-[#3B6CF4]" />
                        <span className="text-sm text-[#3B6CF4]">
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
                  className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-md bg-[#3B6CF4] px-6 text-sm text-white transition hover:bg-[#2E55C9]"
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
