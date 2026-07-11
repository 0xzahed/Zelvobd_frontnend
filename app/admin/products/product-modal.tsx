"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Plus, Trash2, UploadCloud, X } from "lucide-react"
import dynamic from "next/dynamic"
import type { Product, ProductVariant } from "@/lib/types"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { useCreateProduct, useUpdateProduct } from "@/src/hooks/api/useProducts"

const QuillEditor = dynamic(
  () => import("@/components/ui/quill-editor").then((mod) => mod.QuillEditor),
  { ssr: false }
)

function makeVariantId() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyVariant(): ProductVariant {
  return { id: makeVariantId(), color: "", colorCode: "#000000", size: "", actualPrice: 0, discountedPrice: 0, image: "" }
}

function htmlToPlainText(html: string) {
  if (typeof window === "undefined") return (html || "").trim()
  const doc = new DOMParser().parseFromString(html || "", "text/html")
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim()
}

type ProductModalProps = {
  editProduct?: Product | null
  onClose: () => void
}

export function ProductModal({ editProduct, onClose }: ProductModalProps) {
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const { data: categories = [] } = useCategories()

  const [name, setName] = useState(editProduct?.name ?? "")
  const [brand, setBrand] = useState(editProduct?.brand ?? "")
  const [description, setDescription] = useState(editProduct?.description ?? "")
  const [descriptionDelta, setDescriptionDelta] = useState<any>(editProduct?.descriptionDelta ?? null)
  const [extraDescription, setExtraDescription] = useState(editProduct?.extraDescription ?? "")
  const [extraDescriptionDelta, setExtraDescriptionDelta] = useState<any>(editProduct?.extraDescriptionDelta ?? null)
  const [categoryId, setCategoryId] = useState(editProduct?.categoryId ?? "")
  const [subCategoryId, setSubCategoryId] = useState(editProduct?.subCategoryId ?? "")
  const [material, setMaterial] = useState(editProduct?.material ?? "")
  const [weight, setWeight] = useState(editProduct?.weight ?? "")
  const [rating, setRating] = useState<string>(editProduct?.rating?.toString() ?? "")
  const [video, setVideo] = useState(editProduct?.video ?? "")
  const [videoName, setVideoName] = useState("")
  const [stock, setStock] = useState(editProduct?.stock ?? true)
  const [availability, setAvailability] = useState(editProduct?.availability ?? true)
  const [variantLabel, setVariantLabel] = useState(editProduct?.variantLabel ?? "Size")
  const [specifications, setSpecifications] = useState<{ title: string; information: string }[]>(editProduct?.specifications || [])
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (editProduct?.variants && editProduct.variants.length > 0) return editProduct.variants
    return [emptyVariant()]
  })

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const { data: subs = [] } = useSubCategories(categoryId, { enabled: Boolean(categoryId) })

  useEffect(() => {
    if (subs.length > 0) {
      const hasCurrent = subs.some((s: any) => s.id === subCategoryId)
      if (!hasCurrent) setSubCategoryId(subs[0].id)
    } else if (categoryId) {
      setSubCategoryId("")
    }
  }, [subs, subCategoryId, categoryId])

  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    setVariants((list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  const addVariant = () => setVariants((list) => [...list, emptyVariant()])
  const removeVariant = (id: string) => setVariants((list) => (list.length > 1 ? list.filter((v) => v.id !== id) : list))

  const handleImagePick = (file: File | null | undefined, set: (url: string) => void) => {
    if (!file) return
    set(URL.createObjectURL(file))
  }

  const handleVideoPick = (file: File | null | undefined) => {
    if (!file) return
    setVideo(URL.createObjectURL(file))
    setVideoName(file.name)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!htmlToPlainText(description)) return

    const missingImages = variants.filter((v) => !v.image || v.image.trim() === "")
    if (missingImages.length > 0) {
      alert(`Please upload an image for each variant. Missing images for ${missingImages.length} variant(s).`)
      return
    }

    const cleanVariants: ProductVariant[] = variants.map((v) => ({
      id: v.id,
      color: v.color.trim() || "Default",
      colorCode: v.colorCode?.trim() || undefined,
      size: v.size.trim(),
      actualPrice: Math.max(0, Number(v.actualPrice) || 0),
      discountedPrice: Math.max(0, Number(v.discountedPrice) || 0),
      image: v.image || undefined,
    }))

    const first = cleanVariants[0]
    const price = first.discountedPrice || first.actualPrice
    const cutPrice = first.actualPrice
    const discount = cutPrice > price ? Math.round((1 - price / cutPrice) * 100) : 0

    const variantImages = cleanVariants.map((v) => v.image).filter(Boolean) as string[]
    const images = variantImages.length > 0 ? variantImages : editProduct?.images ?? ["/placeholder.svg"]

    const product: Product = {
      id: editProduct?.id ?? `new-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      extraDescription: htmlToPlainText(extraDescription) ? extraDescription.trim() : undefined,
      categoryId,
      subCategoryId,
      categorySlug: "",
      subCategorySlug: "",
      price,
      cutPrice,
      discount,
      rating: rating.trim() !== "" ? parseFloat(rating) : undefined,
      reviews: editProduct?.reviews ?? 0,
      images,
      features: editProduct?.features ?? [],
      isTrending: editProduct?.isTrending ?? false,
      isFlashSale: editProduct?.isFlashSale ?? false,
      weight: weight.trim() || undefined,
      material: material.trim() || undefined,
      stock,
      availability,
      whatsapp: editProduct?.whatsapp ?? "+8801700000000",
      video: video.trim() || undefined,
      variantLabel,
      specifications: specifications.filter((s) => s.title.trim() !== "" && s.information.trim() !== ""),
      variants: cleanVariants,
    }

    if (editProduct) {
      updateMutation.mutate({
        id: editProduct.id,
        product,
        descriptionDelta: descriptionDelta || undefined,
        extraDescriptionDelta: extraDescriptionDelta || undefined,
        categoryId,
        subCategoryId,
      })
    } else {
      createMutation.mutate({
        product,
        descriptionDelta: descriptionDelta || undefined,
        extraDescriptionDelta: extraDescriptionDelta || undefined,
        categoryId,
        subCategoryId,
      })
    }
    onClose()
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
          <h3 className="text-base font-bold text-foreground">{editProduct ? "Edit Product" : "Add New Product"}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="product-form" onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Category & Sub-category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40">
                <option value="">Select Category...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Sub Category</label>
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} disabled={subs.length === 0} className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40 disabled:opacity-50">
                <option value="">Select Sub-category...</option>
                {subs.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Title + Brand */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Title <span className="text-accent">*</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product Title" className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand name" className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40" />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Specifications</span>
              <button type="button" onClick={() => setSpecifications([...specifications, { title: "", information: "" }])} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary/10 px-4 text-xs font-semibold text-primary transition hover:bg-primary/20">
                <Plus className="h-4 w-4" /> Add Specification
              </button>
            </div>
            {specifications.length > 0 && (
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex flex-col gap-3 rounded-md border border-border/40 bg-surface p-3">
                    <div className="flex items-center gap-3">
                      <input type="text" placeholder="Title" value={spec.title} onChange={(e) => { const s = [...specifications]; s[index].title = e.target.value; setSpecifications(s) }} className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
                      <button type="button" onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition hover:bg-destructive/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea rows={3} placeholder="Information" value={spec.information} onChange={(e) => { const s = [...specifications]; s[index].information = e.target.value; setSpecifications(s) }} className="w-full resize-y rounded-md border border-border/80 bg-card p-3 text-sm outline-none focus:border-primary/60" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <QuillEditor label="Description" required value={description} deltaValue={descriptionDelta} onChange={(html, delta) => { setDescription(html); setDescriptionDelta(delta) }} placeholder="Detailed product description..." />

          {/* Warranty */}
          <QuillEditor label="Warranty" value={extraDescription} deltaValue={extraDescriptionDelta} onChange={(html, delta) => { setExtraDescription(html); setExtraDescriptionDelta(delta) }} placeholder="Enter warranty details here..." />

          {/* Material, Weight & Rating */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Material</label>
              <input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Material" className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Weight</label>
              <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 500g, 1.2kg" className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Rating</label>
              <input type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="e.g., 4.5" className="h-11 w-full rounded-lg border border-border/60 bg-card px-4 text-sm outline-none focus:border-primary/40" />
            </div>
          </div>

          {/* Stock & Availability */}
          {editProduct && (
            <div className="flex gap-6">
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer">
                <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                In Stock
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer">
                <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                Available for Purchase
              </label>
            </div>
          )}

          {/* Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Variants</span>
              <button type="button" onClick={addVariant} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90">
                Add Variant
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Variant Label (Size, Storage)</label>
              <input value={variantLabel} onChange={(e) => setVariantLabel(e.target.value)} placeholder="Size" className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
            </div>

            <p className="text-[11px] text-muted-foreground">Minimum one variant is required. Upload a separate image for each.</p>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id} className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Variant {idx + 1}</span>
                    <button type="button" onClick={() => removeVariant(v.id)} disabled={variants.length === 1} aria-label="Remove variant" className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
                    <label className="relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-border/80 bg-card transition hover:border-primary/70 md:mx-0 cursor-pointer">
                      {v.image ? (
                        <img src={v.image} alt={v.color || "Variant"} className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-5 w-5 text-primary" />
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => handleImagePick(e.target.files?.[0], (url) => updateVariant(v.id, { image: url }))} />
                    </label>

                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Color Name</label>
                        <input value={v.color} onChange={(e) => updateVariant(v.id, { color: e.target.value })} required className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Color Code</label>
                        <div className="flex h-10 w-full overflow-hidden rounded-md border border-border/80 bg-card focus-within:border-primary/60">
                          <div className="relative flex h-10 w-12 shrink-0 items-center justify-center border-r border-border/80 bg-surface">
                            <input type="color" value={v.colorCode || "#000000"} onChange={(e) => updateVariant(v.id, { colorCode: e.target.value })} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
                            <div className="h-6 w-6 rounded-md border border-border/50 shadow-sm" style={{ backgroundColor: v.colorCode || "#000000" }} />
                          </div>
                          <input value={v.colorCode || ""} onChange={(e) => updateVariant(v.id, { colorCode: e.target.value })} placeholder="#000000" className="h-full flex-1 bg-transparent px-2 text-sm outline-none cursor-text uppercase" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">{variantLabel || "Size"}</label>
                        <input value={v.size} onChange={(e) => updateVariant(v.id, { size: e.target.value })} className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Price (৳)</label>
                        <input type="number" min={1} value={v.actualPrice || ""} onChange={(e) => updateVariant(v.id, { actualPrice: Number(e.target.value) || 0 })} required className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Discount Price (৳)</label>
                        <input type="number" min={0} value={v.discountedPrice || ""} onChange={(e) => updateVariant(v.id, { discountedPrice: Number(e.target.value) || 0 })} required className="h-10 w-full rounded-md border border-border/80 bg-card px-3 text-sm outline-none focus:border-primary/60" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-foreground">Video Upload (Optional)</span>
            {video ? (
              <div className="relative overflow-hidden rounded-lg border-2 border-border/80 bg-black">
                <video src={video} controls className="h-48 w-full object-contain" />
                <button type="button" onClick={() => { setVideo(""); setVideoName(""); if (videoInputRef.current) videoInputRef.current.value = "" }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500/80 text-white backdrop-blur transition hover:bg-red-600" aria-label="Remove video">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => videoInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-secondary/50 px-4 py-8 text-center transition hover:border-primary/70 hover:bg-secondary">
                <UploadCloud className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">Click to upload video</span>
                <span className="text-xs text-muted-foreground">Maximum video size 100 MB</span>
              </button>
            )}
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoPick(e.target.files?.[0])} />
          </div>

        </form>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-border/30 px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-full px-6 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="product-form" disabled={isSaving} className="rounded-md bg-primary px-8 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70">
            {isSaving ? "Saving..." : editProduct ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  )
}
