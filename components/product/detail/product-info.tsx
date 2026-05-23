"use client"

import { ListChecks, Minus, Plus } from "lucide-react"
import { cx, formatBDT } from "@/lib/format"
import type { Product, ProductVariant } from "@/lib/types"

function colorToHex(name: string): string {
  const key = name.toLowerCase()
  const map: Record<string, string> = {
    black: "#111827",
    "black titanium": "#1f2937",
    white: "#F3F4F6",
    "white titanium": "#E5E7EB",
    silver: "#C0C4CC",
    gold: "#E9C687",
    "rose gold": "#E6B8A2",
    blue: "#2563EB",
    "blue titanium": "#4A5A70",
    "midnight blue": "#1E3A5F",
    "natural titanium": "#A9A299",
    "desert titanium": "#C8B5A3",
    moonstone: "#A8B0B9",
    jade: "#3A8F6B",
    obsidian: "#111827",
    porcelain: "#F1EEE8",
    graphite: "#3A3A3A",
    coral: "#F0746E",
    lemongrass: "#A9B85A",
    sky: "#7CB6E8",
    red: "#DC2626",
    green: "#16A34A",
    pink: "#F472B6",
    purple: "#8B5CF6",
    gray: "#6B7280",
    grey: "#6B7280",
    brown: "#8B5E3C",
    beige: "#D6C6A8",
    navy: "#1E3A8A",
    midnight: "#1B1F2A",
  }
  if (map[key]) return map[key]
  for (const k of Object.keys(map)) {
    if (key.includes(k)) return map[k]
  }
  return "#9CA3AF"
}

interface ProductInfoProps {
  product: Product
  activeVariant: ProductVariant | null
  uniqueColors: string[]
  uniqueSizes: string[]
  selectedColor: string
  selectedSize: string
  onColorChange: (color: string) => void
  onSizeChange: (size: string) => void
  qty: number
  onQtyChange: (qty: number) => void
}

export function ProductInfo({
  product,
  activeVariant,
  uniqueColors,
  uniqueSizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  qty,
  onQtyChange,
}: ProductInfoProps) {
  // If activeVariant is missing, fallback to product level pricing (from mapper)
  const isFlashSale = product.isFlashSale
  const price = isFlashSale && activeVariant?.flashSalePrice != null ? activeVariant.flashSalePrice : (activeVariant?.discountedPrice || product.price)
  const cutPrice = isFlashSale && activeVariant?.flashSalePrice != null ? activeVariant.discountedPrice : (activeVariant?.actualPrice || product.cutPrice)
  const availableSizes = selectedColor
    ? Array.from(
        new Set(
          product.variants
            ?.filter((variant) => variant.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase())
            .map((variant) => variant.size?.trim())
            .filter(Boolean) ?? [],
        ),
      )
    : uniqueSizes

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Title & Pricing */}
      <div className="space-y-1">
        <h1 className="wrap-break-word text-pretty text-xl font-medium leading-snug text-[#292929] md:text-2xl">
          {product.name}
        </h1>
        {product.brand && (
          <p className="text-sm text-muted-foreground">
            by: <span className="font-medium text-primary">{product.brand}</span>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="min-w-0 flex items-baseline flex-wrap gap-2">
            <span className="text-xl font-medium text-[#292929] md:text-2xl">{formatBDT(price)}</span>
            {cutPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatBDT(cutPrice)}
              </span>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              aria-label="Decrease"
              className="grid h-7 w-7 place-items-center rounded-full border border-border/70 bg-card text-foreground"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => onQtyChange(qty + 1)}
              aria-label="Increase"
              className="grid h-7 w-7 place-items-center rounded-full border border-border/70 bg-card text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Color</p>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
            {uniqueColors.map((c) => {
              const selected = selectedColor === c
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => onColorChange(c)}
                  aria-pressed={selected}
                  className={cx(
                    "flex h-full min-w-0 items-center gap-2 rounded-full border bg-transparent px-3 py-1.5 text-left transition md:shrink-0 md:px-4",
                    selected
                      ? "border-primary text-primary"
                      : "border-border/60 text-foreground hover:border-border",
                  )}
                >
                  <span
                    className="h-10 w-10 shrink-0 rounded-full border border-border/40 md:h-11 md:w-11"
                    style={{ backgroundColor: colorToHex(c) }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{c}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Size</p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const selected = selectedSize === s
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => onSizeChange(s)}
                  className={cx(
                    "rounded-full border bg-transparent px-3 py-1 text-sm transition",
                    selected
                      ? "border-primary text-primary bg-primary/5"
                      : "border-border/60 text-foreground hover:border-border",
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div className="border-t border-border/40 pt-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">Description</h3>
          <div
            className="ql-editor p-0 max-w-none wrap-break-word text-justify text-[15px] leading-relaxed text-muted-foreground md:text-base [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Extra Description */}
      {product.extraDescription && (
        <div className="border-t border-border/40 pt-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">More Information</h3>
          <div
            className="ql-editor p-0 max-w-none wrap-break-word text-justify text-[15px] leading-relaxed text-muted-foreground md:text-base [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: product.extraDescription }}
          />
        </div>
      )}
    </div>
  )
}
