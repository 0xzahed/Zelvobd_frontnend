"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useActiveFlashSalesForHome } from "@/src/hooks/api/useFlashSales"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(target: Date): TimeLeft {
  const calc = (): TimeLeft => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [left, setLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    setLeft(calc())
    const t = setInterval(() => setLeft(calc()), 1000)
    return () => clearInterval(t)
  }, [target])
  return left
}

function FlashSaleCard({
  title,
  endTime,
  imageUrl,
  link = "/offers",
}: {
  title: string
  endTime: Date
  imageUrl?: string
  link?: string
}) {
  const time = useCountdown(endTime)

  return (
    <Link
      href={link}
      className={`group relative block h-[60px] w-[345px] shrink-0 snap-start overflow-hidden rounded-lg bg-primary transition hover:shadow-md`}
    >
      {imageUrl && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}
      {imageUrl && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 flex h-full items-center justify-between px-4">
        <span className={`text-sm font-bold drop-shadow-sm ${imageUrl ? "text-white" : "text-primary-foreground"}`}>{title}</span>

        <div className="flex items-center gap-0.5">
          <span className={`inline-flex h-5 w-[22px] items-center justify-center rounded text-[10px] font-bold tabular-nums bg-white text-primary`}>
            {String(time.days).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-white/60">:</span>
          <span className={`inline-flex h-5 w-[22px] items-center justify-center rounded text-[10px] font-bold tabular-nums bg-white text-primary`}>
            {String(time.hours).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-white/60">:</span>
          <span className={`inline-flex h-5 w-[22px] items-center justify-center rounded text-[10px] font-bold tabular-nums bg-white text-primary`}>
            {String(time.minutes).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-white/60">:</span>
          <span className={`inline-flex h-5 w-[22px] items-center justify-center rounded text-[10px] font-bold tabular-nums bg-white text-primary`}>
            {String(time.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function FlashSaleSection() {
  const { data: campaigns, isLoading } = useActiveFlashSalesForHome()
  const cards = (campaigns || []).slice(0, 4)

  if (!isLoading && cards.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground md:text-xl">
          Flash{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
          >
            Sale
          </span>
        </h2>
        <Link
          href="/offers"
          className="text-xs font-semibold text-primary hover:underline md:text-sm"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[60px] w-[345px] shrink-0 snap-start rounded-lg bg-muted animate-pulse md:w-auto"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-visible">
          {cards.map((campaign) => (
            <FlashSaleCard
              key={campaign.id}
              title={campaign.title}
              endTime={new Date(campaign.endAt)}
              imageUrl={campaign.bannerUrl}
            />
          ))}
        </div>
      )}
    </section>
  )
}
