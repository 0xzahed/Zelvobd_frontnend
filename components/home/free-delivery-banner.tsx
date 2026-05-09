"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getFreeDelivery } from "@/src/api/freeDelivery/getFreeDelivery"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

export function FreeDeliveryBanner() {
  const [freeDelivery, setFreeDelivery] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFreeDelivery({ limit: 12 })
        setFreeDelivery(
          (res?.data?.products || []).map((product: any) => ({
            ...mapProduct(product),
            isFreeDelivery: true,
          })),
        )
      } catch {
        setFreeDelivery([])
      }
    }
    void load()
  }, [])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground md:text-xl">Free Delivery</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/free-delivery"
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
          >
            See All
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {freeDelivery.map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
