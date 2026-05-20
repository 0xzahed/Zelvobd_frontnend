"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getProducts } from "@/src/api/products/getProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

const MAX_NEW = 13
let newProductsCache: Product[] | null = null
let newProductsInFlight: Promise<Product[]> | null = null

export function NewProductsSection() {
  const [newItems, setNewItems] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (newProductsCache) {
          if (!cancelled) setNewItems(newProductsCache)
          return
        }
        if (!newProductsInFlight) {
          newProductsInFlight = getProducts({ limit: MAX_NEW, sortBy: "createdAt", sortOrder: "desc" })
            .then((res) => (res?.data?.products || []).map(mapProduct) as Product[])
            .finally(() => {
              newProductsInFlight = null
            })
        }
        const products = await newProductsInFlight
        newProductsCache = products
        if (!cancelled) setNewItems(products)
      } catch {
        if (!cancelled) setNewItems([])
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        {newItems.slice(0, 12).map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
        {newItems.length > 12 && (
          <div className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <Link
              href="/new-products"
              className="group flex h-full items-center justify-center rounded-sm border border-border/60 bg-card p-3 shadow-[0_0_14px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-md"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                More
                <span className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-white text-foreground shadow-sm transition group-hover:border-primary group-hover:text-primary">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
