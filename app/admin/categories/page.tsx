"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Eye, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react"
import type { Category } from "@/lib/types"
import { notify } from "@/lib/notify"
import { useConfirm } from "@/components/ui/confirm-dialog"
import {
  AdminPage,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/admin-ui"
import { getCategoryDetails } from "@/src/api/categoryApi"
import { toAbsoluteUrl, handleApiError } from "@/lib/api-utils"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/src/hooks/api/useCategories"

type CategoryDetails = {
  id: string
  title: string
  slug: string
  imageUrl: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminCategoriesPage() {
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const confirm = useConfirm()

  const [query, setQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewCategory, setViewCategory] = useState<CategoryDetails | null>(null)

  // Modal form state
  const [name, setName] = useState("")
  const [image, setImage] = useState<string>("")
  const imgInputRef = useRef<HTMLInputElement>(null)

  const handleDelete = async (cat: Category) => {
    const ok = await confirm({
      title: "Delete category?",
      message: `Are you sure you want to delete "${cat.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) {
      deleteMutation.mutate(cat.id)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
  }, [categories, query])

  const resetForm = () => {
    setName("")
    setImage("")
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
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const openView = async (cat: Category) => {
    setViewOpen(true)
    setViewLoading(true)
    setViewCategory(null)

    try {
      const res = await getCategoryDetails(cat.id)
      const details = res?.data
      if (!details?.id) throw new Error("Category details not found")

      setViewCategory({
        id: String(details.id),
        title: String(details.title || cat.name),
        slug: String(details.slug || cat.slug),
        imageUrl: toAbsoluteUrl(details.imageUrl || cat.image),
        createdAt: details.createdAt ? String(details.createdAt) : undefined,
        updatedAt: details.updatedAt ? String(details.updatedAt) : undefined,
      })
    } catch (error) {
      handleApiError(error, "Failed to load category")
      setViewOpen(false)
    } finally {
      setViewLoading(false)
    }
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

    if (!editingId && !image) {
      notify.error({
        title: "Image is required",
        message: "Please upload a category image before submitting.",
      })
      return
    }

    const slug = n.toLowerCase().replace(/\s+/g, "-")

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name: n, slug, image: image || undefined } })
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: n,
        slug,
        image: image || "/placeholder.svg",
        subCategories: [],
      }
      createMutation.mutate(newCat)
    }
    closeModal()
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Categories"
        count={`${categories.length} total`}
        actions={
          <AdminToolbar>
            <AdminSearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search categories..."
            />
            <AdminPrimaryButton onClick={openAdd}>
              <Plus className="h-4 w-4" />
              <span className="md:hidden">Add</span>
              <span className="hidden md:inline">Add Category</span>
            </AdminPrimaryButton>
          </AdminToolbar>
        }
      />

      {/* Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
              No categories found.
            </div>
          )}
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="flex overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="relative h-auto w-28 shrink-0 self-stretch overflow-hidden rounded-l-[8px] border-r border-border/40 bg-muted/10">
                <Image
                  src={cat.image || "/placeholder.svg"}
                  alt={cat.name}
                  fill
                  sizes="112px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between p-3 min-h-[120px]">
                <div className="space-y-1">
                  <p className="truncate text-sm font-semibold text-foreground">{cat.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
                <div className="flex w-full gap-1">
                  <button
                    onClick={() => void openView(cat)}
                    aria-label={`View ${cat.name}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-secondary h-7 text-foreground transition hover:bg-primary hover:text-white md:gap-1.5"
                  >
                    <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="text-[10px] font-semibold leading-none">View</span>
                  </button>
                  <button
                    onClick={() => openEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-secondary h-7 text-primary transition hover:bg-primary hover:text-white md:gap-1.5"
                  >
                    <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="text-[10px] font-semibold leading-none">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-accent/10 h-7 text-accent transition hover:bg-accent hover:text-white md:gap-1.5"
                  >
                    <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span className="text-[10px] font-semibold leading-none">Delete</span>
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
              {editingId ? "Edit Category" : "Add New Category"}
            </h3>

            <div className="mx-auto mt-5 h-px w-full bg-border/60" />

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
                    <span className="text-sm text-primary">
                      Click to upload image
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
                className="h-11 min-w-40 rounded-full bg-primary px-8 text-sm text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {viewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setViewOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-center text-lg text-foreground">Category Details</h3>
            <div className="mx-auto mt-5 h-px w-full bg-border/60" />

            {viewLoading && (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading details...</p>
            )}

            {!viewLoading && viewCategory && (
              <div className="mt-5 space-y-4">
                <div className="mx-auto h-36 w-36 overflow-hidden rounded-xl border border-border/60 bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={viewCategory.imageUrl || "/placeholder.svg"}
                    alt={viewCategory.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2 rounded-xl border border-border/60 bg-secondary p-4 text-sm">
                  <p className="text-foreground">
                    <span className="mr-2 font-semibold">Title:</span>
                    {viewCategory.title}
                  </p>
                  <p className="text-foreground">
                    <span className="mr-2 font-semibold">Slug:</span>/{viewCategory.slug}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="mr-2 font-semibold text-foreground">Created:</span>
                      {viewCategory.createdAt
                      ? new Date(viewCategory.createdAt).toLocaleString()
                        : "N/A"}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="mr-2 font-semibold text-foreground">Updated:</span>
                      {viewCategory.updatedAt
                      ? new Date(viewCategory.updatedAt).toLocaleString()
                        : "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPage>
  )
}
