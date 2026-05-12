"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Share2, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { CartBottomSheet } from "@/components/ui/cart-bottom-sheet"
import { ProductCard } from "@/components/ui/product-card"
import { getProducts } from "@/src/api/products/getProducts"
import { getTrending } from "@/src/api/trending/getTrending"
import { mapProduct } from "@/src/api/_shared/mappers"
import { notify } from "@/lib/notify"
import { ProductGallery } from "./detail/product-gallery"
import { ProductInfo } from "./detail/product-info"
import { WhatsAppFab } from "./detail/whatsapp-fab"

interface ProductDetailProps {
  product: Product
  initialVariantId?: string
}

export function ProductDetail({ product, initialVariantId }: ProductDetailProps) {
  const router = useRouter()
  const { addItem, totalCount } = useCart()

  const [cartOpen, setCartOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])

  const variants = product.variants ?? []
  const uniqueColors = Array.from(
    new Set(
      variants
        .map((v) => (v.color || "").trim())
        .filter(Boolean),
    ),
  )
  const uniqueSizes = Array.from(
    new Set(
      variants
        .map((v) => (v.size || "").trim())
        .filter(Boolean),
    ),
  )

  // Identify initial variant
  let initialVariant = variants[0]
  if (initialVariantId) {
    const found = variants.find(v => v.id === initialVariantId)
    if (found) initialVariant = found
  }

  const [selectedColor, setSelectedColor] = useState<string>(
    initialVariant?.color?.trim() || uniqueColors[0] || (variants.length ? "Default" : "")
  )
  const [selectedSize, setSelectedSize] = useState<string>(
    initialVariant?.size?.trim() || uniqueSizes[0] || (variants.length ? "Standard" : "")
  )
  
  // Keep gallery image in sync (memoized so its reference is stable across renders)
  const allImages = useMemo(() => (
    Array.from(new Set([
      ...product.images,
      ...variants.map(v => v.image).filter(Boolean),
    ])) as string[]
  ), [product.images, variants])
  
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Find exact active variant based on selected color and size
  const activeVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  ) || variants.find(v => v.color === selectedColor) || null

  // Update image index when the active variant changes
  useEffect(() => {
    if (!activeVariant?.image) return
    const imgIdx = allImages.indexOf(activeVariant.image)
    if (imgIdx !== -1) setActiveImageIndex(imgIdx)
  }, [activeVariant?.id, activeVariant?.image, allImages])

  // Keep URL in sync with the active variant
  useEffect(() => {
    if (!activeVariant) return
    const categorySlug = product.categorySlug || 'all'
    const subCategorySlug = product.subCategorySlug || 'all'
    const productSlug = product.slug || product.id
    const newUrl = `/${categorySlug}/${subCategorySlug}/${productSlug}/${activeVariant.id}`
    window.history.replaceState(null, '', newUrl)
  }, [activeVariant?.id, product.categorySlug, product.subCategorySlug, product.slug, product.id])

  const handleColorChange = (c: string) => {
    setSelectedColor(c)
    // Optional: Auto-select a valid size for this color if the current size isn't available in this color
    const availableSizesForColor = variants.filter(v => v.color === c).map(v => v.size)
    if (availableSizesForColor.length > 0 && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize(availableSizesForColor[0])
    }
  }

  // When a thumbnail is clicked, update the main image and, if that image
  // belongs to another variant, switch the selected color/size to match —
  // mirroring the behavior of clicking a color swatch.
  const handleImageChange = (index: number) => {
    setActiveImageIndex(index)
    const img = allImages[index]
    if (!img) return
    const variantForImage = variants.find(v => v.image === img)
    if (!variantForImage) return
    if (variantForImage.color && variantForImage.color !== selectedColor) {
      setSelectedColor(variantForImage.color)
      const availableSizesForColor = variants
        .filter(v => v.color === variantForImage.color)
        .map(v => v.size)
      if (availableSizesForColor.length > 0 && !availableSizesForColor.includes(selectedSize)) {
        setSelectedSize(availableSizesForColor[0])
      }
    }
  }

  const handleAdd = () => {
    addItem({ 
      productId: product.id, 
      quantity: qty, 
      color: selectedColor, 
      storage: selectedSize // Mapped to storage for backward compatibility with cart if needed
    })
    notify.success("Added to cart")
  }

  const handleBuy = () => {
    handleAdd()
    router.push("/cart")
  }

  const handleShareCopy = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      notify.success("Link copied")
    } catch {
      const input = document.createElement("textarea")
      input.value = url
      input.setAttribute("readonly", "")
      input.style.position = "absolute"
      input.style.left = "-9999px"
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      notify.success("Link copied")
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadSections = async () => {
      try {
        const [relatedRes, trendingRes] = await Promise.all([
          product.subCategoryId
            ? getProducts({ subCategoryId: product.subCategoryId, limit: 11 })
            : Promise.resolve({ data: { products: [] } }),
          getTrending({ limit: 11 })
        ])

        const related = (relatedRes?.data?.products || [])
          .map(mapProduct)
          .filter((p: Product) => p.id !== product.id)
          .slice(0, 10)

        const trending = (trendingRes?.data?.products || [])
          .map((p: any) => ({ ...mapProduct(p), isTrending: true }))
          .filter((p: Product) => p.id !== product.id)
          .slice(0, 10)

        if (!cancelled) {
          setRelatedProducts(related)
          setTrendingProducts(trending)
        }
      } catch {
        // fail silently
      }
    }

    void loadSections()

    return () => {
      cancelled = true
    }
  }, [product.id, product.subCategoryId])

  return (
    <div className="container pb-20 pt-4 md:pb-10">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-card shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareCopy}
            aria-label="Copy product link"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-card shadow-sm text-foreground"
          >
            <Share2 className="h-5 w-5" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              aria-label="Go to cart"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-card shadow-sm text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={allImages}
          productName={product.name}
          activeImageIndex={activeImageIndex}
          onImageChange={handleImageChange}
        />

        <div className="flex flex-col">
          <ProductInfo
            product={product}
            activeVariant={activeVariant}
            uniqueColors={uniqueColors}
            uniqueSizes={uniqueSizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onColorChange={handleColorChange}
            onSizeChange={setSelectedSize}
            qty={qty}
            onQtyChange={setQty}
          />

          {/* Desktop buttons */}
          <div className="hidden gap-3 mt-8 md:flex">
            <button
              onClick={handleBuy}
              className="h-11 flex-1 rounded-full border border-primary bg-transparent text-sm font-medium text-primary hover:bg-primary/5"
            >
              Buy Now
            </button>
            <button
              onClick={handleAdd}
              className="h-11 flex-1 rounded-full bg-primary text-sm font-medium text-white hover:bg-primary/90"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden">
        <button
          type="button"
          onClick={handleBuy}
          className="relative z-10 h-11 flex-1 rounded-full border border-primary bg-white text-sm font-medium text-primary shadow-md"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="relative z-10 h-11 flex-1 rounded-full bg-primary text-sm font-medium text-white shadow-md"
        >
          Add to Cart
        </button>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-medium text-foreground md:text-xl">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {trendingProducts.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-medium text-foreground md:text-xl">Trending Products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingProducts.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <CartBottomSheet open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppFab number={product.whatsapp} />
    </div>
  )
}
