"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ImagePlus, Plus, Trash2, UploadCloud, X } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { Category, Product, ProductVariant } from "@/lib/types"
import { QuillEditor } from "@/components/ui/quill-editor"
import { AdminSelect } from "@/components/admin/admin-select"

type Props = {
  initial?: Product
  onSave: (p: Product) => void
  onCancel: () => void
}

function makeVariantId() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyVariant(): ProductVariant {
  return { id: makeVariantId(), name: "", price: 0, cutPrice: 0, stock: 0, image: "" }
}

const htmlToPlainText = (html: string) => {
  if (typeof window === "undefined") return html.trim()
  const doc = new DOMParser().parseFromString(html || "", "text/html")
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim()
}

export function ProductForm({ initial, onSave, onCancel }: Props) {
  const { categories } = useAdminStore()
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [extraDescription, setExtraDescription] = useState(initial?.extraDescription ?? "")
  const [categorySlug, setCategorySlug] = useState(
    initial?.categorySlug ?? categories[0]?.slug ?? "",
  )
  const [subCategorySlug, setSubCategorySlug] = useState(
    initial?.subCategorySlug ?? categories[0]?.subCategories[0]?.slug ?? "",
  )
  const [size, setSize] = useState(initial?.size ?? "")
  const [quantity, setQuantity] = useState(initial?.quantity ?? "")
  const [material, setMaterial] = useState(initial?.material ?? "")
  const [color, setColor] = useState(initial?.color ?? "")
  const [weight, setWeight] = useState(initial?.weight ?? "")
  const [video, setVideo] = useState(initial?.video ?? "")
  const [videoName, setVideoName] = useState("")

  const videoInputRef = useRef<HTMLInputElement | null>(null)

  // Variants — at least one required
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initial?.variants && initial.variants.length > 0) return initial.variants
    return [emptyVariant()]
  })

  const subs = useMemo(
    () => categories.find((c) => c.slug === categorySlug)?.subCategories ?? [],
    [categorySlug],
  )

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  // Lock body scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    setVariants((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const addVariant = () => setVariants((list) => [...list, emptyVariant()])

  const removeVariant = (id: string) => {
    setVariants((list) => (list.length > 1 ? list.filter((v) => v.id !== id) : list))
  }

  const handleImagePick = (file: File | null | undefined, set: (url: string) => void) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    set(url)
  }

  const handleVideoPick = (file: File | null | undefined) => {
    if (!file) return
    setVideo(URL.createObjectURL(file))
    setVideoName(file.name)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!htmlToPlainText(description)) return

    const cleanVariants: ProductVariant[] = variants.map((v) => ({
      id: v.id,
      name: v.name.trim() || "Default",
      price: Math.max(0, Number(v.price) || 0),
      cutPrice: Math.max(0, Number(v.cutPrice) || 0),
      stock: Math.max(0, Number(v.stock) || 0),
      image: v.image || undefined,
    }))

    const first = cleanVariants[0]
    const price = first.price
    const cutPrice = first.cutPrice
    const discount = cutPrice > price ? Math.round((1 - price / cutPrice) * 100) : 0
    const totalStock = cleanVariants.reduce((sum, v) => sum + v.stock, 0)

    const variantImages = cleanVariants.map((v) => v.image).filter(Boolean) as string[]
    const images =
      variantImages.length > 0
        ? variantImages
        : initial?.images ?? ["/new-product.jpg"]

    const product: Product = {
      id: initial?.id ?? `new-${Date.now()}`,
      name: name.trim(),
      brand: initial?.brand ?? "",
      description: description.trim(),
      extraDescription: htmlToPlainText(extraDescription) ? extraDescription.trim() : undefined,
      categorySlug,
      subCategorySlug: subs.find((s) => s.slug === subCategorySlug)
        ? subCategorySlug
        : subs[0]?.slug ?? "",
      price,
      cutPrice,
      discount,
      rating: initial?.rating ?? 4.5,
      reviews: initial?.reviews ?? 0,
      images,
      colors: initial?.colors,
      storage: initial?.storage,
      features: initial?.features ?? [],
      isTrending: initial?.isTrending ?? false,
      isFlashSale: initial?.isFlashSale ?? false,
      stock: totalStock,
      whatsapp: initial?.whatsapp ?? "+8801700000000",
      weight: weight.trim() || undefined,
      video: video.trim() || undefined,
      size: size.trim() || undefined,
      quantity: quantity.trim() || undefined,
      material: material.trim() || undefined,
      color: color.trim() || undefined,
      variants: cleanVariants,
    }
    onSave(product)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <form
        onSubmit={submit}
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-card shadow-xl"
      >
        <div className="relative border-b border-border px-5 py-4">
          <h3
            id="product-form-title"
            className="text-center text-base text-foreground"
          >
            {initial ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-[#EEF0FB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {/* Category & Sub-category */}
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Category"
              required
              value={categorySlug}
              onChange={(v) => {
                setCategorySlug(v)
                const next = categories.find((c) => c.slug === v)
                setSubCategorySlug(next?.subCategories[0]?.slug ?? "")
              }}
              options={categories.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <Select
              label="Sub Category"
              required
              value={subCategorySlug}
              onChange={setSubCategorySlug}
              options={subs.map((s) => ({ value: s.slug, label: s.name }))}
            />
          </div>

          {/* Title */}
          <Text label="Title" value={name} onChange={setName} required placeholder="Title" />

          {/* Description */}
          <QuillEditor
            label="Description"
            required
            value={description}
            onChange={setDescription}
            placeholder="Description"
          />

          {/* Extra description */}
          <QuillEditor
            label="Extra description"
            value={extraDescription}
            onChange={setExtraDescription}
            placeholder="Additional info, specs, warranty..."
          />

          {/* Size & Quantity */}
          <div className="grid gap-3 md:grid-cols-2">
            <Text label="Size" value={size} onChange={setSize} placeholder="e.g., XL, Large" />
            <Text
              label="Quantity"
              required
              value={quantity}
              onChange={setQuantity}
              placeholder="e.g., 24 PCS"
            />
          </div>

          {/* Material & Color */}
          <div className="grid gap-3 md:grid-cols-2">
            <Text label="Material" value={material} onChange={setMaterial} placeholder="Material" />
            <Text label="Color" value={color} onChange={setColor} placeholder="Color" />
          </div>

          {/* Weight */}
          <Text
            label="Weight"
            required
            value={weight}
            onChange={setWeight}
            placeholder="e.g., 500g, 1.2kg"
          />

          {/* Variants */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Variants</span>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex h-9 items-center gap-1 rounded-md bg-[#10B981] px-3 text-xs text-white shadow-sm hover:bg-[#0EA373]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Variant
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Minimum one variant is required. Upload a separate image for each.
            </p>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="rounded-md border border-border bg-[#F7F9FD] p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Variant {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(v.id)}
                      disabled={variants.length === 1}
                      aria-label="Remove variant"
                      className="grid h-7 w-7 place-items-center rounded-full bg-[#FF3B3B]/10 text-[#FF3B3B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[72px_1fr]">
                    <label className="relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-md border-2 border-dashed border-[#306FD7]/40 bg-card">
                      {v.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.image || "/placeholder.svg"}
                          alt={v.name || "Variant"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-[#306FD7]" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) =>
                          handleImagePick(e.target.files?.[0], (url) =>
                            updateVariant(v.id, { image: url }),
                          )
                        }
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <label className="col-span-2 block text-xs md:col-span-1">
                        <span className="mb-1 block text-foreground">Name</span>
                        <input
                          value={v.name}
                          onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                          placeholder="e.g., Red / XL"
                          className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs outline-none"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="mb-1 block text-foreground">Price (৳)</span>
                        <input
                          type="number"
                          min={0}
                          value={v.price}
                          onChange={(e) =>
                            updateVariant(v.id, { price: Number(e.target.value) || 0 })
                          }
                          className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs outline-none"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="mb-1 block text-foreground">Cut price</span>
                        <input
                          type="number"
                          min={0}
                          value={v.cutPrice}
                          onChange={(e) =>
                            updateVariant(v.id, { cutPrice: Number(e.target.value) || 0 })
                          }
                          className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs outline-none"
                        />
                      </label>
                      <label className="block text-xs">
                        <span className="mb-1 block text-foreground">Stock</span>
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(v.id, { stock: Number(e.target.value) || 0 })
                          }
                          className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs outline-none"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div className="pt-2">
            <span className="mb-1 block text-sm text-foreground">Video Upload</span>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[#306FD7]/40 bg-[#EEF4FF]/50 px-4 py-5 text-center transition hover:bg-[#EEF4FF]"
            >
              <UploadCloud className="h-5 w-5 text-[#306FD7]" />
              <span className="text-sm text-[#306FD7]">
                {videoName ? videoName : "Click to upload video"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Maximum video size 500 MB
              </span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleVideoPick(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-card px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm text-foreground hover:bg-[#EEF0FB]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#306FD7] px-6 py-2 text-sm text-white hover:opacity-95"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

function Text({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-foreground">
        {label} {required && <span className="text-[#FF3B3B]">*</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#306FD7]"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  rows?: number
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-foreground">
        {label} {required && <span className="text-[#FF3B3B]">*</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[#306FD7]"
      />
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-foreground">
        {label} {required && <span className="text-[#FF3B3B]">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-[#306FD7] bg-[#EEF4FF] px-3 text-sm text-[#306FD7] outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
