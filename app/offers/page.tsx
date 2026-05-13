"use client"

import Link from "next/link"
import Image from "next/image"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { useBanners } from "@/src/hooks/api/useBanners"
import { formatRelativeTime } from "@/lib/format"
import type { Slider } from "@/lib/types"

export default function OffersPage() {
  const { data: banners = [], isLoading } = useBanners()

  return (
    <AppShell>
      <BackHeader title="Offers" />
      <div className="space-y-6 py-4 md:space-y-8 md:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-muted-foreground text-sm">Loading offers...</span>
          </div>
        ) : banners.length > 0 ? (
          banners.map((slide: Slider) => (
            <div key={slide.id} className="flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{slide.title || "Untitled"}</h3>
                {slide.subtitle && <p className="text-sm text-foreground">{slide.subtitle}</p>}
              </div>

              <Link href={slide.link} className="relative block w-full overflow-hidden rounded-lg shadow-card transition-transform hover:-translate-y-0.5">
                <div className="relative flex aspect-16/8 w-full items-center overflow-hidden md:aspect-16/5" style={{ background: `linear-gradient(120deg, ${slide.bg}, ${slide.bg}cc 60%, var(--foreground) 120%)` }}>
                  <Image
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title || "Offer Banner"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-8 left-5 z-10 md:bottom-12 md:left-10">
                    <span className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-primary shadow-sm md:h-11 md:px-6 md:text-sm">Shop Now</span>
                  </div>
                </div>
              </Link>

              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(slide.createdAt)}
              </p>
              
              <hr className="mt-2 border-t border-border" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-lg font-medium text-foreground">No active offers right now</p>
            <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
