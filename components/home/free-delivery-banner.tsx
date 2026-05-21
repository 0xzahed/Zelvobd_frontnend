"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getFreeDelivery } from "@/src/api/freeDelivery/getFreeDelivery"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

export function FreeDeliveryBanner() {
  const [freeDelivery, setFreeDelivery] = useState<Product[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFreeDelivery({ limit: 13 })
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

  if (freeDelivery.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground md:text-xl">Free Delivery</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/free-delivery"
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
          >
            See All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {freeDelivery.slice(0, 12).map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
        {freeDelivery.length > 12 && (
          <div className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <Link
              href="/free-delivery"
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
