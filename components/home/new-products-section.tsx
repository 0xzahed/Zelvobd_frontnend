"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { getProducts } from "@/src/api/products/getProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

const MAX_NEW = 12

export function NewProductsSection() {
  const [newItems, setNewItems] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProducts({ limit: MAX_NEW, sortBy: "createdAt", sortOrder: "desc" })
        const products = (res?.data?.products || []).map(mapProduct) as Product[]
        setNewItems(products)
      } catch {
        setNewItems([])
      }
    }
    void load()
  }, [])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary md:h-6 md:w-6" />
          <h2 className="text-base font-medium text-foreground md:text-xl">New Products</h2>
        </div>
        <Link
          href="/new-products"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {newItems.map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
