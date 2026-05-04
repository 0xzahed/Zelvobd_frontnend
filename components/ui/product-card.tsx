"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { useCart } from "@/contexts/cart-context"

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart()

  const src =
    product.images?.[0] ||
    `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`

  const savings = product.cutPrice > product.price ? product.cutPrice - product.price : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, quantity: 1 })
  }

  const categorySlug = product.categorySlug || 'uncategorized'
  const subCategorySlug = product.subCategorySlug || 'all'
  const productSlug = product.slug || product.id
  const variantId = product.variants?.[0]?.id || 'default'
  const productUrl = `/${categorySlug}/${subCategorySlug}/${productSlug}/${variantId}`

  return (
    <Link
      href={productUrl}
      className={cx(
        "group relative flex h-full snap-start flex-col overflow-hidden rounded-sm border border-border/60 bg-card p-3 shadow-[0_0_14px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-md",
        compact
          ? "w-40 shrink-0 sm:w-44"
          : "w-full p-2.5 md:h-80 md:max-w-225 md:p-2",
      )}
    >
      {/* Image */}
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-xl bg-card",
          compact ? "aspect-square" : "aspect-5/4 md:aspect-auto md:flex-1 md:min-h-0",
        )}
      >
        <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
          {product.isFlashSale && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-semibold text-destructive md:text-[10px]">
              Flash Sale
            </span>
          )}
          {product.isFreeDelivery && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 md:text-[10px]">
              Free Delivery
            </span>
          )}
        </div>
        <Image
          src={src || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 20vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        {/* Title */}
        <h3
          className={cx(
            "font-semibold leading-tight text-foreground wrap-break-word",
            compact
              ? "min-h-9 line-clamp-2 text-sm"
              : "min-h-10 line-clamp-2 text-base md:min-h-7 md:line-clamp-1 md:text-xl",
          )}
        >
          {product.name}
        </h3>

        {/* Current price */}
        <div
          className={cx(
            "mt-1 font-medium text-foreground",
            compact ? "text-[15px]" : "text-[15px] md:text-xl",
          )}
        >
          {formatBDT(product.price)}
        </div>

        {/* Keep a fixed row so card height stays consistent on mobile */}
        <div className="mt-1 min-h-4 flex items-center flex-wrap gap-1.5 overflow-hidden">
          {product.cutPrice > product.price && (
            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground line-through">
              {formatBDT(product.cutPrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 md:text-[11px]">
              {formatBDT(savings)} OFF
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2.5">
          <span className="flex h-9 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground transition-colors group-hover:bg-muted/50">
            Shop Now
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add to cart"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
