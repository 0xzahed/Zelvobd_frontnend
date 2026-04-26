"use client"

import Link from "next/link"
import { ChevronRight, Truck } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

export function FreeDeliveryBanner() {
  const { products, loaded } = useProducts()

  const freeDelivery = products.filter((p) => p.isFreeDelivery)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-[#306FD7] md:h-6 md:w-6" />
          <h2 className="text-base font-bold text-foreground md:text-xl">Free Delivery</h2>
        </div>
        <Link
          href="/free-delivery"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#306FD7] md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {freeDelivery.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
