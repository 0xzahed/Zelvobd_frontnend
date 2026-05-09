"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"
import { CartBottomSheet } from "@/components/ui/cart-bottom-sheet"
import { ProductCard } from "@/components/ui/product-card"
import { getProducts } from "@/src/api/products/getProducts"
import { getTrending } from "@/src/api/trending/getTrending"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductGallery } from "./detail/product-gallery"
import { ProductInfo } from "./detail/product-info"
import { ProductShareModal } from "./detail/product-share-modal"
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
  const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)))
  const uniqueSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)))

  // Identify initial variant
  let initialVariant = variants[0]
  if (initialVariantId) {
    const found = variants.find(v => v.id === initialVariantId)
    if (found) initialVariant = found
  }

  const [selectedColor, setSelectedColor] = useState<string>(initialVariant?.color || uniqueColors[0] || "")
  const [selectedSize, setSelectedSize] = useState<string>(initialVariant?.size || uniqueSizes[0] || "")
  
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
  }

  const handleBuy = () => {
    handleAdd()
    router.push("/cart")
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
        if (!cancelled) {
          setRelatedProducts([])
          setTrendingProducts([])
        }
      }
    }

    void loadSections()

    return () => {
      cancelled = true
    }
  }, [product.id, product.subCategoryId])

  return (
    <div className="pb-28 md:pb-8">
      {/* Mobile sub-header */}
      <div className="-mx-4 mt-2 flex items-center justify-between bg-card px-4 py-2 md:hidden">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <ProductShareModal 
            productName={product.name} 
            variantColor={selectedColor}
            barcodeUrl={activeVariant?.barcodeUrl} 
          />
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card text-foreground hover:bg-secondary"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-5 py-3 md:grid-cols-2 md:gap-10 md:py-8">
        {/* Left Column: Gallery */}
        <ProductGallery 
          images={allImages}
          productName={product.name}
          activeImageIndex={activeImageIndex}
          onImageChange={handleImageChange}
        />

        {/* Right Column: Info & Actions */}
        <div className="flex flex-col relative">
          <div className="hidden md:block absolute right-0 top-0">
            <ProductShareModal 
              productName={product.name} 
              variantColor={selectedColor}
              barcodeUrl={activeVariant?.barcodeUrl} 
            />
          </div>

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
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {trendingProducts.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-medium text-foreground md:text-xl">Trending Products</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
            {trendingProducts.map((p) => (
              <div
                key={p.id}
                className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]"
              >
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
