"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Flame } from "lucide-react"
import { ProductCard } from "@/components/ui/product-card"
import { CountdownTimer } from "@/components/ui/countdown-timer"
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
        setItems((res?.data?.products || []).map(mapProduct))

        const campaign = campaignRes?.data?.campaigns?.[0] || campaignRes?.data || {}
        const apiBg = campaign?.bgImage || campaign?.backgroundImage || campaign?.bg || ""
        const storedBg = localStorage.getItem(FLASH_SALE_BG_STORAGE_KEY) || ""
        setBackgroundImage(apiBg || storedBg)
      } catch {
        setItems([])
        const storedBg = localStorage.getItem(FLASH_SALE_BG_STORAGE_KEY) || ""
        setBackgroundImage(storedBg)
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
          <div className="flex shrink-0 items-center gap-1"><h2 className="text-sm font-bold text-foreground md:text-base">Flash Sale</h2><Flame className="h-4 w-4 text-[#FF3B3B]" fill="#FF3B3B" /></div>
          <div className="min-w-0 flex-1" />
          <CountdownTimer days={0} hours={0} minutes={0} compact />
          <Link href="/offers" className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-[#306FD7] md:text-xs">See All <ChevronRight className="h-3 w-3" /></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </section>
  )
}
