"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Flame, Truck } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { useCart } from "@/contexts/cart-context"
import { notify } from "@/lib/notify"

export function ProductCard({
  product,
  compact = false,
  emphasis = false,
}: {
  product: Product
  compact?: boolean
  emphasis?: boolean
}) {
  const { addItem } = useCart()
  const src =
    product.images?.[0] ||
    `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`
  const savings = product.cutPrice > product.price ? product.cutPrice - product.price : 0
  const discountPercent =
    product.cutPrice > product.price && product.cutPrice > 0
      ? Math.round((savings / product.cutPrice) * 100)
      : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, quantity: 1 })
    notify.success("Added to cart")
  }

  const categorySlug = product.categorySlug || 'uncategorized'
  const subCategorySlug = product.subCategorySlug || 'all'
  const productSlug = product.slug || product.id
  const productUrl = `/${categorySlug}/${subCategorySlug}/${productSlug}`

  return (
    <Link
      href={productUrl}
      className={cx(
        "group relative flex h-full snap-start flex-col overflow-hidden rounded-sm border border-border/60 bg-card p-3 shadow-[0_0_14px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-md",
        compact
          ? "w-44 shrink-0 md:w-48 lg:w-56"
          : emphasis
            ? "w-full p-4 md:h-96 md:max-w-225"
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
        <div className="absolute right-0.5 top-0.5 z-10 flex flex-col items-center gap-1">
          {product.isFlashSale && (
            <div
              className={cx(
                "grid shrink-0 place-items-center rounded-full bg-destructive/10",
                emphasis ? "h-9 w-9 md:h-10 md:w-10" : "h-7 w-7 md:h-8 md:w-8",
              )}
            >
              <Flame className={cx("text-destructive", emphasis ? "h-5 w-5 md:h-6 md:w-6" : "h-4 w-4 md:h-5 md:w-5")} />
            </div>
          )}
          {product.isFreeDelivery && (
            <div
              className={cx(
                "grid shrink-0 place-items-center rounded-full bg-emerald-100",
                emphasis ? "h-9 w-9 md:h-10 md:w-10" : "h-7 w-7 md:h-8 md:w-8",
              )}
            >
              <Truck className={cx("text-emerald-700", emphasis ? "h-5 w-5 md:h-6 md:w-6" : "h-4 w-4 md:h-5 md:w-5")} />
            </div>
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

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        {/* Title */}
        <h3
          className={cx(
            "block w-full truncate whitespace-nowrap font-semibold leading-tight text-foreground",
            compact
              ? "text-sm"
              : emphasis
                ? "text-lg md:text-2xl"
                : "text-base md:text-xl",
          )}
        >
          {product.name}
        </h3>

        {/* Current price */}
        <div
          className={cx(
            "mt-1 truncate whitespace-nowrap font-semibold text-foreground",
            compact
              ? "text-[15px]"
              : emphasis
                ? "text-base md:text-2xl"
                : "text-[15px] md:text-xl",
          )}
        >
          {formatBDT(product.price)}
        </div>

        {/* Keep a fixed row so card height stays consistent on mobile */}
        <div className="mt-1 min-h-4 flex items-center gap-1 overflow-hidden whitespace-nowrap">
          {product.cutPrice > product.price && (
            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground line-through">
              {formatBDT(product.cutPrice)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 md:px-2 md:text-[11px]">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2.5">
          <span
            className={cx(
              "flex flex-1 items-center justify-center rounded-full border border-border font-medium text-foreground transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
              emphasis ? "h-10 text-base" : "h-9 text-sm",
            )}
          >
            Shop Now
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add to cart"
            className={cx(
              "flex shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted",
              emphasis ? "h-10 w-10" : "h-9 w-9",
            )}
          >
            <ShoppingCart className={cx(emphasis ? "h-5 w-5" : "h-4 w-4")} />
          </button>
        </div>
      </div>
    </Link>
  )
}
