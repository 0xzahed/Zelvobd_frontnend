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

  return (
    <Link
      href={`/product/${product.id}`}
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 transition-shadow hover:shadow-md",
        compact
          ? "w-40 shrink-0 sm:w-44"
          : "w-full md:h-[320px] md:max-w-[900px] md:p-2",
      )}
    >
      {/* Image */}
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-xl bg-card",
          compact ? "aspect-square" : "aspect-[5/4] md:aspect-auto md:flex-1 md:min-h-0",
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

      {/* Title */}
      <h3
        className={cx(
          "mt-3 line-clamp-1 font-semibold text-foreground",
          compact ? "text-sm" : "text-xl",
        )}
      >
        {product.name}
      </h3>

      {/* Current price */}
      <div
        className={cx(
          "mt-1 font-medium text-foreground",
          compact ? "text-[15px]" : "text-xl",
        )}
      >
        {formatBDT(product.price)}
      </div>

      {/* Cut price + savings pill */}
      {(product.cutPrice > product.price || savings > 0) && (
        <div className="mt-1 flex items-center gap-2">
          {product.cutPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBDT(product.cutPrice)}
            </span>
          )}
          {savings > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {formatBDT(savings)} OFF
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
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
    </Link>
  )
}
