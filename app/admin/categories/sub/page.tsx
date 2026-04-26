"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { SubCategory } from "@/lib/types"
import { notify } from "@/lib/notify"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { AdminSelect } from "@/components/admin/admin-select"

export default function AdminSubCategoriesPage() {
  const { categories, addSubCategory, updateSubCategory, deleteSubCategory } = useAdminStore()
  const confirm = useConfirm()

  const handleDeleteSub = async (parentId: string, sub: SubCategory) => {
    const ok = await confirm({
      title: "Delete sub-category?",
      message: `Are you sure you want to delete "${sub.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) deleteSubCategory(parentId, sub.id)
  }

  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingParentId, setEditingParentId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [image, setImage] = useState<string>("")
  const [parentCategoryId, setParentCategoryId] = useState<string>("")
  const imgInputRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let subs = categories.flatMap((c) =>
      c.subCategories.map((s) => ({
        ...s,
        parentId: c.id,
        parentName: c.name,
        parentSlug: c.slug,
      })),
    )
    if (selectedCategoryId !== "all") {
      subs = subs.filter((s) => s.parentId === selectedCategoryId)
    }
    if (q) {
      subs = subs.filter((s) => s.name.toLowerCase().includes(q))
    }
    return subs
  }, [categories, query, selectedCategoryId])

  const resetForm = () => {
    setName("")
    setImage("")
    setParentCategoryId("")
    setEditingId(null)
    setEditingParentId(null)
  }

  const openAdd = () => {
    resetForm()
    setParentCategoryId(selectedCategoryId !== "all" ? selectedCategoryId : "")
    setShowModal(true)
  }

  const openEdit = (sub: SubCategory & { parentId: string }) => {
    setEditingId(sub.id)
    setEditingParentId(sub.parentId)
    setName(sub.name)
    setImage(sub.image)
    setParentCategoryId(sub.parentId)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const pickImage = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = () => {
    const n = name.trim()
    if (!n) return
    if (!parentCategoryId) {
      notify.error("Please select a parent category")
      return
    }

    if (editingId && editingParentId) {
      updateSubCategory(editingParentId, editingId, { name: n, image: image || undefined })
    } else {
      const slug = n.toLowerCase().replace(/\s+/g, "-")
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: n,
        slug,
        image: image || "/placeholder.svg",
      }
      addSubCategory(parentCategoryId, newSub)
    }
    closeModal()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-card p-4 shadow-card md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-3 md:max-w-lg">
            {/* Category filter */}
            <div className="w-44 shrink-0">
              <AdminSelect
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
            </div>
            {/* Search */}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sub-category..."
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-[#306FD7]/60"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 md:gap-4">
            <h2 className="text-base text-foreground md:text-lg"></h2>
            <button
              onClick={openAdd}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#306FD7] px-4 text-sm text-white transition hover:bg-[#2E57D6]"
            >
              <Plus className="h-4 w-4" />
              Add Sub Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-lg border border-border/60">
          <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 border-b border-border/60 bg-[#F7F9FD] px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground md:grid-cols-[48px_1fr_1fr_auto]">
            <span className="hidden md:block" aria-hidden />
            <span className="md:text-left">Title</span>
            <span className="text-muted-foreground">Parent</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-border/60">
            {rows.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                No sub-categories yet. Click &quot;Add Sub Category&quot; to create one.
              </li>
            )}
            {rows.map((sub) => (
              <li
                key={sub.id}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-5 py-3 transition hover:bg-[#F7F9FD] md:grid-cols-[48px_1fr_1fr_auto]"
              >
                <div className="hidden h-10 w-10 overflow-hidden rounded-full ring-1 ring-border/60 md:block">
                  <Image
                    src={sub.image || "/placeholder.svg"}
                    alt={sub.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-border/60 md:hidden">
                    <Image
                      src={sub.image || "/placeholder.svg"}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="truncate text-sm text-foreground">{sub.name}</p>
                </div>

                <p className="truncate text-xs text-muted-foreground">{sub.parentName}</p>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEdit(sub)}
                    aria-label={`Edit ${sub.name}`}
                    className="grid h-8 w-8 place-items-center rounded-md text-[#306FD7] transition hover:bg-[#EEF0FB]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSub(sub.parentId, sub)}
                    aria-label={`Delete ${sub.name}`}
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
              {editingId ? "Edit Sub-category" : "Add New Sub-category"}
            </h3>

            <div className="mx-auto mt-5 h-px w-full bg-border/60" />

            {/* Parent category */}
            {!editingId && (
              <div className="mt-5">
                <label className="mb-1.5 block text-xs text-foreground">Parent Category</label>
                <AdminSelect
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  className="h-12 px-4"
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            )}

            {/* Title */}
            <div className="mt-5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Title"
                className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-[#306FD7]/60"
              />
            </div>

            {/* Image upload */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-foreground">Image Upload</label>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-[#306FD7]/40 bg-[#EEF0FB]/60 py-6 text-center transition hover:border-[#306FD7]/70 hover:bg-[#EEF0FB]"
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
                    <ImagePlus className="h-5 w-5 text-[#306FD7]" />
                    <span className="text-sm text-[#306FD7]">Click to upload image</span>
                    <span className="text-[11px] text-muted-foreground">Max size 5 MB</span>
                  </>
                )}
              </button>
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={submit}
                disabled={!name.trim() || (!editingId && !parentCategoryId)}
                className="h-11 min-w-40 rounded-full bg-[#306FD7] px-8 text-sm text-white transition hover:bg-[#2E57D6] disabled:cursor-not-allowed disabled:opacity-50"
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
