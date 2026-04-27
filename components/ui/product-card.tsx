"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatBDT } from "@/lib/format"
import { cx } from "@/lib/format"

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const src =
    product.images?.[0] ||
    `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`

  return (
    <Link
      href={`/product/${product.id}`}
      className={cx(
        "group relative block overflow-hidden rounded-md bg-card shadow-card transition-transform hover:-translate-y-0.5",
        compact ? "w-40 shrink-0 sm:w-44" : "w-full",
      )}
    >
      {product.discount > 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-[#FF3B3B] px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
          -{product.discount}%
        </span>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-[#F7F8FC]">
        <Image
          src={src || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1.5 p-3 pb-4">
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-foreground">{formatBDT(product.price)}</span>
          {product.cutPrice > product.price && (
            <span className="text-[12px] text-muted-foreground line-through">{formatBDT(product.cutPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
