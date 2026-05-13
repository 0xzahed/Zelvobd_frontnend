"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import type { SubCategory } from "@/lib/types"
import { notify } from "@/lib/notify"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { AdminSelect } from "@/components/admin/admin-select"
import {
  useCategories,
  useSubCategories,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
} from "@/src/hooks/api/useCategories"

export default function AdminSubCategoriesPage() {
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateSubCategory()
  const updateMutation = useUpdateSubCategory()
  const deleteMutation = useDeleteSubCategory()

  const confirm = useConfirm()

  const [query, setQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingParentId, setEditingParentId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [image, setImage] = useState<string>("")
  const [parentCategoryId, setParentCategoryId] = useState<string>("")
  const imgInputRef = useRef<HTMLInputElement>(null)

  // This will fetch subcategories for the selected category automatically
  const { data: subCategories = [], isLoading: isLoadingSubs } = useSubCategories(selectedCategoryId, { enabled: Boolean(selectedCategoryId) })

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId("")
      return
    }

    const hasCurrentCategory = categories.some((c) => c.id === selectedCategoryId)
    if (!hasCurrentCategory) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const handleDeleteSub = async (parentId: string, sub: SubCategory) => {
    const ok = await confirm({
      title: "Delete sub-category?",
      message: `Are you sure you want to delete "${sub.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) {
      deleteMutation.mutate({ categoryId: parentId, subId: sub.id })
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let subs = subCategories
    
    if (q) {
      subs = subs.filter((s) => s.name.toLowerCase().includes(q))
    }
    return subs
  }, [subCategories, query])

  const resetForm = () => {
    setName("")
    setImage("")
    setParentCategoryId("")
    setEditingId(null)
    setEditingParentId(null)
  }

  const openAdd = () => {
    resetForm()
    setParentCategoryId(selectedCategoryId)
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

    if (!editingId && !image) {
      notify.error("Please upload an image for the sub-category")
      return
    }

    if (editingId && editingParentId) {
      updateMutation.mutate({
        categoryId: editingParentId,
        subId: editingId,
        data: { name: n, image: image || undefined },
      })
    } else {
      const slug = n.toLowerCase().replace(/\s+/g, "-")
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: n,
        slug,
        image: image || "/placeholder.svg",
      }
      createMutation.mutate({ categoryId: parentCategoryId, sub: newSub })
    }
    closeModal()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Sub-Categories</h2>
          <p className="text-xs text-muted-foreground">{rows.length} total</p>
        </div>
        <div className="flex w-full items-center gap-2">
          <div className="flex h-10 min-w-0 flex-[3] items-center gap-2 rounded-sm bg-card px-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sub-categories..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={openAdd}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Sub Category
          </button>
        </div>
      </div>

      {/* Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.length === 0 && (
            <div className="col-span-full rounded-[8px] border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground">
              {isLoadingSubs
                ? "Loading sub-categories..."
                : selectedCategoryId
                ? "No sub-categories in this category yet."
                : "No categories found. Create a category first."}
            </div>
          )}
          {rows.map((sub) => (
            <div
              key={sub.id}
              className="flex rounded-[8px] border border-border/40 bg-card shadow-sm transition hover:bg-secondary/30 overflow-hidden"
            >
              <div className="relative h-auto w-28 shrink-0 self-stretch overflow-hidden rounded-l-[8px] border-r border-border/40 bg-muted/10">
                <Image
                  src={sub.image || "/placeholder.svg"}
                  alt={sub.name}
                  fill
                  sizes="112px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between p-3 min-h-[120px]">
                <div className="space-y-1">
                  <p className="truncate text-sm font-semibold text-foreground">{sub.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{sub.parentName}</p>
                </div>
                <div className="flex w-full gap-1">
                  <button
                    onClick={() => openEdit(sub)}
                    aria-label={`Edit ${sub.name}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-secondary h-7 text-primary transition hover:bg-primary hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSub(sub.parentId, sub)}
                    aria-label={`Delete ${sub.name}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent/10 h-7 text-accent transition hover:bg-accent hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary"
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
                className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary/60"
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
                className="flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border-2 border-dashed border-primary/40 bg-secondary/60 py-6 text-center transition hover:border-primary/70 hover:bg-secondary"
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
                    <ImagePlus className="h-5 w-5 text-primary" />
                    <span className="text-sm text-primary">Click to upload image</span>
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
                className="h-11 min-w-40 rounded-full bg-primary px-8 text-sm text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
