"use client"

import Link from "next/link"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

export function FreeDeliveryBanner() {
  const { products, loaded } = useProducts()

  const freeDelivery = products.filter((p) => p.isFreeDelivery)

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
