"use client"

import { useState } from "react"

import { ListChecks, Minus, Plus, Truck } from "lucide-react"
import { cx, formatBDT } from "@/lib/format"
import type { Product, ProductVariant } from "@/lib/types"
import dynamic from "next/dynamic"

const QuillEditor = dynamic(
  () => import("@/components/ui/quill-editor").then((mod) => mod.QuillEditor),
  { ssr: false }
)

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
  const [activeTab, setActiveTab] = useState<"specification" | "description" | "warranty">("specification")

  // If activeVariant is missing, fallback to product level pricing (from mapper)
  const isFlashSale = product.isFlashSale
  const price = isFlashSale && activeVariant?.flashSalePrice != null ? activeVariant.flashSalePrice : (activeVariant?.discountedPrice || product.price)
  const cutPrice = isFlashSale && activeVariant?.flashSalePrice != null ? activeVariant.discountedPrice : (activeVariant?.actualPrice || product.cutPrice)
  const availableSizes = selectedColor
    ? Array.from(
        new Set(
          product.variants
            ?.filter((variant) => variant.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase())
            .flatMap((variant) => variant.size?.split(',').map(s => s.trim()).filter(Boolean) ?? []) ?? [],
        ),
      )
    : uniqueSizes

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Title & Pricing */}
      <div className="space-y-1">
        {product.brand && (
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            {product.brand}
          </p>
        )}
        <h1 className="wrap-break-word text-pretty text-2xl font-semibold leading-snug text-gray-900">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="min-w-0 flex items-baseline flex-wrap gap-2">
            <span className="text-[22px] font-bold text-gray-900">{formatBDT(price)}</span>
            {cutPrice > price && (
              <span className="text-[16px] font-normal text-[#d6d6d6] line-through">
                {formatBDT(cutPrice)}
              </span>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3 rounded-full bg-[#e5e5e580] p-1.5">
            <button
              type="button"
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              aria-label="Decrease"
              className="grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-sm transition hover:bg-gray-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-black">{qty}</span>
            <button
              type="button"
              onClick={() => onQtyChange(qty + 1)}
              aria-label="Increase"
              className="grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-sm transition hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div className="rounded-sm border border-gray-200 p-4 bg-white/50">
          <p className="mb-3 text-base font-semibold text-gray-900">Color:</p>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((c) => {
              const selected = selectedColor === c
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => onColorChange(c)}
                  aria-pressed={selected}
                  className={cx(
                    "flex h-9 items-center gap-2 rounded-full border bg-white px-3 transition",
                    selected
                      ? "border-primary border-[1.5px]"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span
                    className="h-4.5 w-4.5 shrink-0 rounded-full border border-gray-100 shadow-inner"
                    style={{ backgroundColor: product.variants?.find(v => v.color?.trim().toLowerCase() === c.toLowerCase())?.colorCode || colorToHex(c) }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-700">{c}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div className="rounded-sm border border-gray-200 p-4 bg-white/50 mt-4 md:mt-5">
          <p className="mb-3 text-base font-semibold text-gray-900">
            {product.variantLabel || "Size"}:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const selected = selectedSize === s
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => onSizeChange(s)}
                  className={cx(
                    "flex h-9 items-center justify-center rounded-full border bg-white px-4 transition",
                    selected
                      ? "border-primary border-[1.5px]"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <span className="text-sm font-medium text-gray-700">{s}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Delivery Timescale */}
      <div className="rounded-sm border border-gray-200 p-4 bg-white/50 flex items-center gap-3">
        <Truck className="h-6 w-6 text-gray-700" strokeWidth={1.5} />
        <p className="text-base text-[#171717]">
          Delivery Timescale: <span className="font-semibold">24 Hours - 3 Days</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        {(["specification", "description", "warranty"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cx(
              "px-4 py-2 rounded-sm shadow-sm text-[14px] font-medium transition",
              activeTab === tab 
                ? "bg-primary text-white" 
                : "bg-[#fcfcfc] text-[#292929] hover:bg-gray-100"
            )}
          >
            {tab === "specification" && "Specification"}
            {tab === "description" && "Description"}
            {tab === "warranty" && "Warentee"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-4 md:pt-6">
        {/* Specification Tab */}
        {activeTab === "specification" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900">Specification</h3>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-200">
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className="divide-x divide-gray-200">
                        <td className="w-1/3 p-3 align-middle text-base text-[#525252]">
                          {spec.title}
                        </td>
                        <td className="bg-white p-3 align-middle text-base font-semibold text-gray-900">
                          {spec.information}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specifications available.</p>
            )}
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            {product.description ? (
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-900">Description</h3>
                <QuillEditor 
                  readOnly 
                  deltaValue={product.descriptionDelta} 
                  value={product.description} 
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No description available.</p>
            )}
          </div>
        )}

        {/* Warranty Tab */}
        {activeTab === "warranty" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900">Warentee</h3>
            {product.extraDescription ? (
              <QuillEditor 
                readOnly 
                deltaValue={product.extraDescriptionDelta} 
                value={product.extraDescription} 
              />
            ) : (
              <p className="text-sm text-gray-500">No warranty information available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
