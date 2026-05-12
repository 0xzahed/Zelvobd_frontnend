"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ui/product-card"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { LottieIcon } from "@/components/ui/lottie-icon"
import { getAllActiveFlashSaleProducts } from "@/src/api/flashSale/getAllActiveFlashSaleProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"

export function FlashSaleSection() {
  const [items, setItems] = useState<Product[]>([])
  const [backgroundImage, setBackgroundImage] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllActiveFlashSaleProducts({ limit: 13 })
        setItems(
          (res?.data?.products || []).map((product: any) => ({
            ...mapProduct(product),
            isFlashSale: true,
          })),
        )

        const campaign = res?.data?.campaigns?.[0] || {}
        const apiBg = campaign?.bgImage || campaign?.backgroundImage || campaign?.bg || ""

        setBackgroundImage(apiBg)
      } catch {
        setItems([])
        setBackgroundImage("")
      }
    }
    void load()
  }, [])

  return (
    <section className="space-y-3">
      <div
        className="relative overflow-hidden rounded-lg border border-border/60 bg-card"
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {backgroundImage && <div className="absolute inset-0 bg-black/25" />}
        <div className="relative z-10 flex min-h-20 items-center gap-2 p-5 md:min-h-24 md:p-6">
          <div className="flex shrink-0 items-center gap-2">
            <LottieIcon
              src="/fire-animaiton.json"
              className="block h-6 w-6 md:h-7 md:w-7"
              ariaLabel="Flash sale"
            />
            <h2 className="text-base font-semibold text-foreground md:text-lg">Flash Sale</h2>
          </div>
          <div className="min-w-0 flex-1" />
          <CountdownTimer days={0} hours={0} minutes={0} compact />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {items.slice(0, 12).map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} emphasis />
          </div>
        ))}
        {items.length > 12 && (
          <div className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <Link
              href="/offers"
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
