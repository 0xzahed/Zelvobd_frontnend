"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

export function TrendingSection() {
  const { products, loaded } = useProducts()

  const trending = products.filter((p) => p.isTrending)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground md:text-xl">Trending Products</h2>
        <Link
          href="/trending"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#3B6CF4] md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {trending.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
