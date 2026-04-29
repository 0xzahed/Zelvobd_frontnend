"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/ui/product-card"
import { cx } from "@/lib/format"

type Sort = "relevance" | "priceAsc" | "priceDesc" | "discount" | "rating"

export function SubCategoryClient({
  initialItems,
  fallbackItems,
}: {
  initialItems: Product[]
  fallbackItems: Product[]
}) {
  const items = initialItems.length > 0 ? initialItems : fallbackItems
  const [sort, setSort] = useState<Sort>("relevance")
  const [filter, setFilter] = useState<"all" | "flash" | "trending">("all")

  const filtered = useMemo(() => {
    let list = [...items]
    if (filter === "flash") list = list.filter((p) => p.isFlashSale)
    if (filter === "trending") list = list.filter((p) => p.isTrending)
    switch (sort) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price)
        break
      case "priceDesc":
        list.sort((a, b) => b.price - a.price)
        break
      case "discount":
        list.sort((a, b) => b.discount - a.discount)
        break
      case "rating":
        list.sort((a, b) => b.rating - a.rating)
        break
    }
    return list
  }, [items, sort, filter])

  const chip = (active: boolean) =>
    cx(
      "rounded-full border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap",
      active ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground",
    )

  return (
    <div className="space-y-4 py-4 md:py-6">
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        <button className={chip(false)} aria-label="Filter">
          <SlidersHorizontal className="mr-1 inline h-3.5 w-3.5" /> Filter
        </button>
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All
        </button>
        <button onClick={() => setFilter("flash")} className={chip(filter === "flash")}>
          Flash Sale
        </button>
        <button onClick={() => setFilter("trending")} className={chip(filter === "trending")}>
          Trending
        </button>
        <span className="mx-1 h-5 w-px bg-border" />
        <div className="flex items-center gap-1 text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-border bg-card px-2 py-1.5 text-xs font-medium text-foreground outline-none"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="discount">Best Discount</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-10 text-center shadow-card">
          <p className="text-sm text-muted-foreground">No products match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
