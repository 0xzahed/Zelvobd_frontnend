"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getTrending } from "@/src/api/trending/getTrending"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/ui/product-card"

export function TrendingSection() {
  const [trending, setTrending] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrending({ limit: 12 })
        setTrending(
          (res?.data?.products || []).map((product: any) => ({
            ...mapProduct(product),
            isTrending: true,
          })),
        )
      } catch {
        setTrending([])
      }
    }
    void load()
  }, [])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground md:text-xl">Trending Products</h2>
        <Link
          href="/trending"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {trending.map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
