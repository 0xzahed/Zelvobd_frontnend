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
        "group relative flex h-full snap-start flex-col overflow-hidden rounded-sm border border-border/60 bg-card p-1 shadow-[0_0_14px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-md",
        compact
          ? "w-44 shrink-0 md:w-48 lg:w-56"
          : emphasis
            ? "w-full p-3 md:h-96 md:max-w-225"
            : "w-full md:h-80 md:max-w-225",
      )}
    >
      {/* Discount badge - top left tag using Vector.svg */}
      {discountPercent > 0 && (
        <div className="absolute left-2 top-2 z-10">
          <span
            className="flex items-center justify-center text-[8px] font-bold text-white"
            style={{
              backgroundImage: 'url(/Vector.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              width: '52px',
              height: '20px',
              paddingLeft: '2px',
            }}
          >
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Image */}
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-xl bg-transparent",
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
            compact
              ? "text-[14px]"
              : emphasis
                ? "text-[14px] md:text-lg"
                : "text-[14px]",
          )}
        >
          {product.name}
        </h3>

        {/* Price + Cut price - same line, left aligned, smaller */}
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={cx(
              "font-semibold text-foreground",
              compact
                ? "text-[11px]"
                : emphasis
                  ? "text-xs md:text-base"
                  : "text-[11px] md:text-sm",
            )}
          >
            {formatBDT(product.price)}
          </span>
          {product.cutPrice > product.price && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatBDT(product.cutPrice)}
            </span>
          )}
        </div>

        {/* Flash / Free Delivery badges - below price, left aligned */}
        <div className="mt-1 flex items-center gap-1">
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

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span
            className={cx(
              "flex flex-1 items-center justify-center rounded-full text-xs font-semibold text-white",
              emphasis ? "h-9" : "h-8",
            )}
            style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
          >
            Buy Now
          </span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add to cart"
            className={cx(
              "flex shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted",
              emphasis ? "h-9 w-9" : "h-8 w-8",
            )}
          >
            <ShoppingCart className={cx(emphasis ? "h-4 w-4" : "h-3.5 w-3.5")} />
          </button>
        </div>
      </div>
    </Link>
  )
}
