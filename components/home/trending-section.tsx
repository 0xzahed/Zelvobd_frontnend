"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getProducts } from "@/src/api/products/getProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/ui/product-card"

const TRENDING_PRODUCT_STORAGE_KEY = "admin-trending-product-ids"

export function TrendingSection() {
  const [trending, setTrending] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const storedIdsRaw =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem(TRENDING_PRODUCT_STORAGE_KEY) || "[]")
            : []
        const selectedIds: string[] = Array.isArray(storedIdsRaw) ? storedIdsRaw : []
        if (selectedIds.length === 0) {
          setTrending([])
          return
        }

        const res = await getProducts({ limit: 100 })
        const allProducts = (res?.data?.products || []).map(mapProduct) as Product[]
        const byId = new Map(allProducts.map((p) => [p.id, p]))
        const selectedProducts = selectedIds
          .map((id) => byId.get(id))
          .filter((p): p is Product => Boolean(p))

        setTrending(selectedProducts)
      } catch {
        setTrending([])
      }
    }
    void load()
  }, [])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground md:text-xl">Trending Products</h2>
        <Link
          href="/trending"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#306FD7] md:text-xs"
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
