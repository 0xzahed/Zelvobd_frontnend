"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ui/product-card"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { getAllActiveFlashSaleProducts } from "@/src/api/flashSale/getAllActiveFlashSaleProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"

let flashCache: {
  items: Product[]
  backgroundImage: string
  campaignTitle?: string
  campaignStartAt?: string | number | null
  serverTime?: string | number
} | null = null
let flashInFlight: Promise<{
  items: Product[]
  backgroundImage: string
  campaignTitle?: string
  campaignStartAt?: string | number | null
  serverTime?: string | number
}> | null = null

export function FlashSaleSection() {
  const [items, setItems] = useState<Product[]>([])
  const [backgroundImage, setBackgroundImage] = useState("")
  const [campaignTitle, setCampaignTitle] = useState("Flash Sale")
  const [campaignStartAt, setCampaignStartAt] = useState<string | number | null>(null)
  const [serverTime, setServerTime] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (flashCache) {
          if (!cancelled) {
            setItems(flashCache.items)
            setBackgroundImage(flashCache.backgroundImage)
          }
          return
        }
        if (!flashInFlight) {
          flashInFlight = getAllActiveFlashSaleProducts({ limit: 13 })
            .then((res) => {
              const nextItems = (res?.data?.products || []).map((product: any) => ({
                ...mapProduct(product),
                isFlashSale: true,
              }))
              const campaign = res?.data?.campaigns?.[0] || {}
              const apiBg = campaign?.bgImage || campaign?.backgroundImage || campaign?.bg || ""
              return {
                items: nextItems,
                backgroundImage: apiBg,
                campaignTitle: campaign?.title,
                campaignStartAt: campaign?.startAt,
                serverTime: res?.data?.serverTime,
              }
            })
            .finally(() => {
              flashInFlight = null
            })
        }
        const next = await flashInFlight
        flashCache = next
        if (!cancelled) {
          setItems(next.items)
          setBackgroundImage(next.backgroundImage)
          setCampaignTitle(typeof next.campaignTitle === "string" && next.campaignTitle.trim() ? next.campaignTitle : "Flash Sale")
          setCampaignStartAt(next.campaignStartAt ?? null)
          const parsedServerTime = next.serverTime ? new Date(next.serverTime).getTime() : Number.NaN
          setServerTime(Number.isNaN(parsedServerTime) ? null : parsedServerTime)
        }
      } catch {
        if (!cancelled) {
          setItems([])
          setBackgroundImage("")
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  const startAtMs = campaignStartAt ? new Date(campaignStartAt).getTime() : null
  const campaignInitials = campaignTitle
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-sm font-semibold text-muted-foreground">Upcoming Campaigns</h2>
      </div>
      <div className="rounded-2xl bg-muted/30 p-3">
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-white">
          {backgroundImage && (
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          <div className="relative flex items-center gap-3 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white shadow-[0_1px_8px_rgba(15,23,42,0.12)] ring-1 ring-black/5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">{campaignInitials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-orange-600">Campaign starts in</p>
                <p className="truncate text-sm font-semibold text-foreground">{campaignTitle}</p>
              </div>
            </div>
            <div className="ml-auto">
              <CountdownTimer
                variant="campaign"
                targetTime={startAtMs ?? undefined}
                serverTime={serverTime ?? undefined}
              />
            </div>
          </div>
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
