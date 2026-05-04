"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ui/product-card"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { LottieIcon } from "@/components/ui/lottie-icon"
import { getAllActiveFlashSaleProducts } from "@/src/api/flashSale/getAllActiveFlashSaleProducts"
import { getActiveFlashSaleCampaign } from "@/src/api/flashSale/getActiveFlashSaleCampaign"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"

const FLASH_SALE_BG_STORAGE_KEY = "flash-sale-bg-image"

export function FlashSaleSection() {
  const [items, setItems] = useState<Product[]>([])
  const [backgroundImage, setBackgroundImage] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [res, campaignRes] = await Promise.all([
          getAllActiveFlashSaleProducts({ limit: 12 }),
          getActiveFlashSaleCampaign().catch(() => null),
        ])
        setItems(
          (res?.data?.products || []).map((product: any) => ({
            ...mapProduct(product),
            isFlashSale: true,
          })),
        )

        const campaign = campaignRes?.data?.campaigns?.[0] || campaignRes?.data || {}
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
        <div className="relative z-10 flex items-center gap-2 p-3 md:p-4">
          <div className="flex shrink-0 items-center gap-1"><LottieIcon src="/fire-animaiton.json" className="block h-5 w-5 md:h-6 md:w-6" ariaLabel="Flash sale" /><h2 className="text-sm font-medium text-foreground md:text-base">Flash Sale</h2></div>
          <div className="min-w-0 flex-1" />
          <CountdownTimer days={0} hours={0} minutes={0} compact />
          <Link href="/offers" className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs">See All <ChevronRight className="h-3 w-3" /></Link>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {items.map((p) => (
          <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
