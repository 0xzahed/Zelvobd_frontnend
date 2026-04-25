"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { Category } from "@/lib/types"
import { notify } from "@/lib/notify"

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminStore()

  const [query, setQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Modal form state
  const [name, setName] = useState("")
  const [image, setImage] = useState<string>("")
  const [banner, setBanner] = useState<string>("")
  const imgInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
  }, [categories, query])

  const resetForm = () => {
    setName("")
    setImage("")
    setBanner("")
    setEditingId(null)
  }

  const openAdd = () => {
    resetForm()
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setImage(cat.image ?? "")
    setBanner("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const pickImage = (file: File | undefined, setter: (s: string) => void) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = () => {
    const n = name.trim()
    if (!n) return
    const normalized = n.toLowerCase()
    const hasDuplicate = categories.some(
      (cat) => cat.id !== editingId && cat.name.trim().toLowerCase() === normalized,
    )
    if (hasDuplicate) {
      notify.error({
        title: "Category already exists",
        message: "Please use a different category name.",
      })
      return
    }
    const slug = n.toLowerCase().replace(/\s+/g, "-")

    if (editingId) {
      updateCategory(editingId, { name: n, slug, image: image || undefined })
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: n,
        slug,
        image: image || "/placeholder.svg",
        subCategories: [],
      }
      addCategory(newCat)
    }
    closeModal()
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-xl bg-card p-4 shadow-card md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left: search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-[#3B6CF4]/60"
            />
          </div>

          {/* Right: title + add */}
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <h2 className="text-base text-foreground md:text-lg"></h2>
            <button
              onClick={openAdd}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#3B6CF4] px-4 text-sm text-white transition hover:bg-[#2E57D6]"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 bg-[#F7F9FD] px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground md:grid-cols-[48px_1fr_1fr_auto]">
            <span className="hidden md:block" aria-hidden />
            <span className="md:text-left">Title</span>
            <span className="hidden text-muted-foreground md:block">Slug</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-border/60">
            {filtered.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                No categories found.
              </li>
            )}
            {filtered.map((cat) => (
              <li
                key={cat.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 transition hover:bg-[#F7F9FD] md:grid-cols-[48px_1fr_1fr_auto]"
              >
                <div className="hidden h-10 w-10 overflow-hidden rounded-full ring-1 ring-border/60 md:block">
                  <Image
                    src={cat.image || "/placeholder.svg"}
                    alt={cat.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-border/60 md:hidden">
                    <Image
                      src={cat.image || "/placeholder.svg"}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="truncate text-sm text-foreground">{cat.name}</p>
                </div>

                <p className="hidden truncate text-xs text-muted-foreground md:block">
                  /{cat.slug}
                </p>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-[#3B6CF4] transition hover:bg-[#EEF0FB]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    aria-label={`Delete ${cat.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-[#FF3B3B] transition hover:bg-[#FF3B3B]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-[#EEF0FB]"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-center text-lg text-foreground">
              {editingId ? "Edit Category" : "Add New Category"}
            </h3>

            <div className="mx-auto mt-5 h-px w-full bg-border/60" />

            {/* Title */}
            <div className="mt-5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Title"
                className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-[#3B6CF4]/60"
              />
            </div>

            {/* Image upload */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-foreground">
                Image Upload
              </label>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0], setImage)}
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-[#3B6CF4]/40 bg-[#EEF0FB]/60 py-6 text-center transition hover:border-[#3B6CF4]/70 hover:bg-[#EEF0FB]"
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-28 w-full object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-[#3B6CF4]" />
                    <span className="text-sm text-[#3B6CF4]">
                      Click to upload image
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Max size 5 MB
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Banner upload */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-foreground">
                Banner Upload
              </label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0], setBanner)}
              />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-[#3B6CF4]/40 bg-[#EEF0FB]/60 py-6 text-center transition hover:border-[#3B6CF4]/70 hover:bg-[#EEF0FB]"
              >
                {banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner || "/placeholder.svg"}
                    alt="Banner preview"
                    className="h-24 w-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-[#3B6CF4]" />
                    <span className="text-sm text-[#3B6CF4]">
                      Click to upload banner
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Max size 5 MB
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={submit}
                disabled={!name.trim()}
                className="h-11 min-w-[160px] rounded-full bg-[#3B6CF4] px-8 text-sm text-white transition hover:bg-[#2E57D6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
