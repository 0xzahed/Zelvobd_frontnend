"use client"

import Image from "next/image"
import Link from "next/link"
import { Flame, Truck, Star } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { ShinyText } from "@/components/ui/shiny-text"

export function ProductCard({
  product,
  compact = false,
  emphasis = false,
}: {
  product: Product
  compact?: boolean
  emphasis?: boolean
}) {
  const src =
    product.images?.[0] ||
    `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`
  const savings = product.cutPrice > product.price ? product.cutPrice - product.price : 0
  const discountPercent =
    product.cutPrice > product.price && product.cutPrice > 0
      ? Math.round((savings / product.cutPrice) * 100)
      : 0

  const categorySlug = product.categorySlug || 'uncategorized'
  const subCategorySlug = product.subCategorySlug || 'all'
  const productSlug = product.slug || product.id
  const productUrl = `/${categorySlug}/${subCategorySlug}/${productSlug}`

  return (
    <Link
      href={productUrl}
      className={cx(
        "group relative flex h-full snap-start flex-col overflow-hidden rounded-lg border border-border/60 bg-card",
        compact
          ? "w-44 shrink-0 md:w-48 lg:w-56"
          : emphasis
            ? "w-full p-3 md:h-96 md:max-w-225"
            : "w-full md:h-80 md:max-w-225",
      )}
    >
      {/* Discount badge - circular */}
      {discountPercent > 0 && (
        <div className="absolute left-1.5 top-1.5 z-10">
          <span className="flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-2 py-1">
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Image */}
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-t-lg bg-transparent",
          compact ? "aspect-square" : "aspect-square md:aspect-auto md:flex-1 md:min-h-0",
        )}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 20vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="mt-2 flex min-w-0 flex-1 flex-col">
        {/* Title - 2 lines, centered */}
        <h3
          className={cx(
            "line-clamp-2 text-center font-semibold leading-tight text-foreground",
            compact ? "text-[14px]" : "text-[16px]",
          )}
        >
          {product.name}
        </h3>

        {/* Price + Cut price - same line, left aligned, smaller */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <span
            className={cx(
              "font-semibold text-foreground",
              compact ? "text-[11px]" : "text-[14px]",
            )}
          >
              {formatBDT(product.price)}
          </span>
          {product.cutPrice > product.price && (
            <span className="text-[12px] text-muted-foreground line-through">
              {formatBDT(product.cutPrice)}
            </span>
          )}
        </div>

        {/* Flash / Free Delivery badges - below price, left aligned */}
        <div className="mt-2 flex items-center justify-center gap-1">
          {product.isFlashSale && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] font-semibold text-red-600">
              <Flame className="h-2.5 w-2.5" /> Flash Sale
            </span>
          )}
          {product.isFreeDelivery && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700">
              <Truck className="h-2.5 w-2.5" /> Free Delivery
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cx(
                  "h-3 w-3",
                  i < Math.round(product.rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            ({typeof product.rating === "number" ? product.rating.toFixed(1) : "0.0"})
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto px-2 pt-2 pb-2">
          <span
            className={cx(
              "flex w-full items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
              "border border-[#6C95E9] text-[#6C95E9] bg-[#EBF1FD]",
              "hover:border-transparent hover:text-white hover:bg-[linear-gradient(45deg,#052F84,#7BA4F7)]",
              emphasis ? "h-9" : "h-8",
            )}
          >
            <ShinyText text="Buy Now" />
          </span>
        </div>
      </div>
    </Link>
  )
}
