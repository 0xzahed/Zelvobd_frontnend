"use client"

import { useEffect, useRef, useState } from "react"
import { ImagePlus, Plus, Trash2, UploadCloud, X } from "lucide-react"
import type { Product, ProductVariant } from "@/lib/types"
import dynamic from "next/dynamic"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { AdminSelect } from "@/components/admin/admin-select"

const QuillEditor = dynamic(
  () => import("@/components/ui/quill-editor").then((mod) => mod.QuillEditor),
  { ssr: false }
)

type Props = {
  initial?: Product
  onSave: (
    p: Product,
    descriptionDelta: any,
    extraDescriptionDelta: any,
    categoryId: string,
    subCategoryId: string
  ) => void
  onCancel: () => void
  isSaving?: boolean
  variant?: "card" | "plain"
}

function makeVariantId() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyVariant(): ProductVariant {
  return { id: makeVariantId(), color: "", colorCode: "#000000", size: "", actualPrice: 0, discountedPrice: 0, image: "" }
}

const htmlToPlainText = (html: string) => {
  if (typeof window === "undefined") return html.trim()
  const doc = new DOMParser().parseFromString(html || "", "text/html")
  return (doc.body.textContent || "").replace(/\u00a0/g, " ").trim()
}

export function ProductForm({ initial, onSave, onCancel, isSaving, variant = "card" }: Props) {
  const { data: categories = [] } = useCategories()
  
  const [name, setName] = useState(initial?.name ?? "")
  const [brand, setBrand] = useState(initial?.brand ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [descriptionDelta, setDescriptionDelta] = useState<any>(initial?.descriptionDelta ?? null)
  
  const [extraDescription, setExtraDescription] = useState(initial?.extraDescription ?? "")
  const [extraDescriptionDelta, setExtraDescriptionDelta] = useState<any>(
    initial?.extraDescriptionDelta ?? null,
  )
  
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "")
  const [subCategoryId, setSubCategoryId] = useState(initial?.subCategoryId ?? "")
  
  const [material, setMaterial] = useState(initial?.material ?? "")
  const [weight, setWeight] = useState(initial?.weight ?? "")
  const [video, setVideo] = useState(initial?.video ?? "")
  const [videoName, setVideoName] = useState(() => {
    if (initial?.video) {
      const parts = initial.video.split("/")
      return parts[parts.length - 1]
    }
    return ""
  })

  const [stock, setStock] = useState<boolean>(initial?.stock ?? true)
  const [availability, setAvailability] = useState<boolean>(initial?.availability ?? true)
  const [variantLabel, setVariantLabel] = useState(initial?.variantLabel ?? "Size")
  const [specifications, setSpecifications] = useState<{title: string; information: string}[]>(
    initial?.specifications || []
  )

  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initial?.variants && initial.variants.length > 0) return initial.variants
    return [emptyVariant()]
  })

  // Auto-select first category if none is selected and categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const { data: subs = [] } = useSubCategories(categoryId, { enabled: Boolean(categoryId) })

  // Auto-select first subcategory when category changes
  useEffect(() => {
    if (subs.length > 0) {
      const hasCurrent = subs.some(s => s.id === subCategoryId)
      if (!hasCurrent) {
        setSubCategoryId(subs[0].id)
      }
    } else {
      if (categoryId) setSubCategoryId("") // No subs available
    }
  }, [subs, subCategoryId, categoryId])

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

    // Validate that all variants have images
    const missingImages = variants.filter(v => !v.image || v.image.trim() === '')
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
    const images =
      variantImages.length > 0
        ? variantImages
        : initial?.images ?? ["/new-product.jpg"]

    const product: Product = {
      id: initial?.id ?? `new-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      extraDescription: htmlToPlainText(extraDescription) ? extraDescription.trim() : undefined,
      categorySlug: "", // We rely on categoryId now
      subCategorySlug: "", // We rely on subCategoryId now
      categoryId,
      subCategoryId,
      price,
      cutPrice,
      discount,
      rating: initial?.rating ?? 4.5,
      reviews: initial?.reviews ?? 0,
      images,
      features: initial?.features ?? [],
      isTrending: initial?.isTrending ?? false,
      isFlashSale: initial?.isFlashSale ?? false,
      weight: weight.trim() || undefined,
      material: material.trim() || undefined,
      stock,
      availability,
      whatsapp: initial?.whatsapp ?? "+8801700000000",
      video: video.trim() || undefined,
      variantLabel,
      specifications: specifications.filter(s => s.title.trim() !== "" && s.information.trim() !== ""),
      variants: cleanVariants,
    }
    onSave(product, descriptionDelta, extraDescriptionDelta, categoryId, subCategoryId)
  }

  const formClassName =
    variant === "plain"
      ? "flex w-full flex-col overflow-hidden rounded-lg bg-transparent"
      : "flex w-full flex-col overflow-hidden rounded-lg bg-card shadow-sm border border-border/40"

  const contentClassName =
    variant === "plain"
      ? "flex-1 space-y-4 p-3 sm:p-5"
      : "flex-1 space-y-5 p-5 md:p-6"

  const footerClassName =
    variant === "plain"
      ? "flex justify-end gap-3 border-t border-border/30 bg-transparent px-3 py-3 sm:px-5"
      : "flex justify-end gap-3 border-t border-border/40 bg-card px-6 py-4"

  return (
    <form onSubmit={submit} className={formClassName}>
      <div className={contentClassName}>
        {/* Category & Sub-category */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Category</label>
            <AdminSelect
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categories.length === 0}
              className="h-11 px-4"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Sub Category</label>
            <AdminSelect
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled={subs.length === 0}
              className="h-11 px-4"
            >
              <option value="">Select Sub-category...</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>

        {/* Title + Brand */}
        <div className="grid gap-4 md:grid-cols-2">
          <Text label="Title" value={name} onChange={setName} required placeholder="Product Title" />
          <Text label="Brand" value={brand} onChange={setBrand} placeholder="Brand name" />
        </div>

        {/* Specifications */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Specifications</span>
            <button
              type="button"
              onClick={() => setSpecifications([...specifications, { title: "", information: "" }])}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary/10 px-4 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" /> Add Specification
            </button>
          </div>
          {specifications.length > 0 && (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-md border border-border/40 bg-muted/10 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Title"
                      value={spec.title}
                      onChange={(e) => {
                        const newSpecs = [...specifications];
                        newSpecs[index].title = e.target.value;
                        setSpecifications(newSpecs);
                      }}
                      className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = specifications.filter((_, i) => i !== index);
                        setSpecifications(newSpecs);
                      }}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Information"
                    value={spec.information}
                    onChange={(e) => {
                      const newSpecs = [...specifications];
                      newSpecs[index].information = e.target.value;
                      setSpecifications(newSpecs);
                    }}
                    className="w-full resize-y rounded-md border border-border/80 bg-background p-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <QuillEditor
          label="Description"
          required
          value={description}
          deltaValue={descriptionDelta}
          onChange={(html, delta) => {
            setDescription(html)
            setDescriptionDelta(delta)
          }}
          placeholder="Detailed product description..."
        />

        {/* Warranty */}
        <QuillEditor
          label="Warranty"
          value={extraDescription}
          deltaValue={extraDescriptionDelta}
          onChange={(html, delta) => {
            setExtraDescription(html)
            setExtraDescriptionDelta(delta)
          }}
          placeholder="Enter warranty details here..."
        />

        {/* Material & Weight */}
        <div className="grid gap-4 md:grid-cols-2">
          <Text label="Material" value={material} onChange={setMaterial} placeholder="Material" />
          <Text label="Weight" value={weight} onChange={setWeight} placeholder="e.g., 500g, 1.2kg" />
        </div>

        {/* Stock & Availability Checkboxes */}
        {initial && (
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={stock}
                  onChange={(e) => setStock(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20"
                />
              </div>
              In Stock
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-foreground cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20"
                />
              </div>
              Available for Purchase
            </label>
          </div>
        )}

        {/* Variants */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Variants</span>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Add Variant
            </button>
          </div>

          <label className="block text-xs">
            <span className="mb-1.5 block font-semibold text-foreground">Variant Label (Size, Storage)</span>
            <input 
              type="text" 
              value={variantLabel} 
              onChange={(e) => setVariantLabel(e.target.value)}
              placeholder="Size"
              className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
            />
          </label>

          <p className="text-[11px] text-muted-foreground">
            Minimum one variant is required. Upload a separate image for each.
          </p>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.id}
                className="rounded-lg border border-border/80 bg-background p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Variant {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    disabled={variants.length === 1}
                    aria-label="Remove variant"
                    className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent transition hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent/10 disabled:hover:text-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[96px_1fr] md:items-start">
                  <label className="relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-border/80 bg-background transition hover:border-primary/70 md:mx-0 cursor-pointer">
                    {v.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.image || "/placeholder.svg"}
                        alt={v.color || "Variant"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-primary" />
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

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <label className="block text-xs">
                      <span className="mb-1.5 block font-semibold text-foreground">Color Name</span>
                      <input
                        value={v.color}
                        onChange={(e) => updateVariant(v.id, { color: e.target.value })}
                        required
                        className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                      />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1.5 block font-semibold text-foreground">Color Code</span>
                      <div className="flex h-10 w-full overflow-hidden rounded-md border border-border/80 bg-background focus-within:border-primary/60">
                        <div className="relative flex h-10 w-12 shrink-0 items-center justify-center border-r border-border/80 bg-muted/30">
                          <input
                            type="color"
                            value={v.colorCode || "#000000"}
                            onChange={(e) => updateVariant(v.id, { colorCode: e.target.value })}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                          />
                          <div
                            className="h-6 w-6 rounded-md border border-border/50 shadow-sm"
                            style={{ backgroundColor: v.colorCode || "#000000" }}
                          />
                        </div>
                        <input
                          type="text"
                          value={v.colorCode || ""}
                          onChange={(e) => updateVariant(v.id, { colorCode: e.target.value })}
                          placeholder="#000000"
                          className="h-full flex-1 bg-transparent px-2 text-sm outline-none cursor-text caret-current uppercase"
                        />
                      </div>
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1.5 block font-semibold text-foreground">{variantLabel || "Size"}</span>
                      <input
                        value={v.size}
                        onChange={(e) => updateVariant(v.id, { size: e.target.value })}
                        className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                      />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1.5 block font-semibold text-foreground">Price (৳)</span>
                      <input
                        type="number"
                        min={1}
                        value={v.actualPrice || ""}
                        onChange={(e) =>
                          updateVariant(v.id, { actualPrice: Number(e.target.value) || 0 })
                        }
                        required
                        className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                      />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1.5 block font-semibold text-foreground">Discount Price (৳)</span>
                      <input
                        type="number"
                        min={0}
                        value={v.discountedPrice || ""}
                        onChange={(e) =>
                          updateVariant(v.id, { discountedPrice: Number(e.target.value) || 0 })
                        }
                        required
                        className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none focus:border-primary/60 cursor-text caret-current"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Upload */}
        <div className="pt-3">
          <span className="mb-2 block text-sm font-semibold text-foreground">Video Upload (Optional)</span>
          {video ? (
            <div className="relative overflow-hidden rounded-lg border-2 border-border/80 bg-black">
              <video src={video} controls className="h-48 w-full object-contain" />
              <button
                type="button"
                onClick={() => {
                  setVideo("")
                  setVideoName("")
                  if (videoInputRef.current) videoInputRef.current.value = ""
                }}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500/80 text-white backdrop-blur transition hover:bg-red-600"
                aria-label="Remove video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 bg-secondary/50 px-4 py-8 text-center transition hover:border-primary/70 hover:bg-secondary"
            >
              <UploadCloud className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Click to upload video
              </span>
              <span className="text-xs text-muted-foreground">
                Maximum video size 100 MB
              </span>
            </button>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleVideoPick(e.target.files?.[0])}
          />
        </div>
      </div>

      <div className={footerClassName}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-full px-6 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary px-8 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-70"
        >
          {isSaving ? "Saving..." : initial ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
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
      <span className="mb-1.5 block font-semibold text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 cursor-text caret-current"
      />
    </label>
  )
}
