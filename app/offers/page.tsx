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

      <div className="mx-auto max-w-md space-y-4 py-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border/50 bg-card">
            <span className="text-muted-foreground text-sm">Loading offers...</span>
          </div>
        ) : banners.length > 0 ? (
          banners.map((slide: Slider) => (
            <Link
              key={slide.id}
              href={slide.link}
              className="block rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all hover:shadow-md active:scale-[0.995]"
            >
              {/* Image on top */}
              {slide.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title || "Offer"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-4 space-y-2">
                {/* Title */}
                <h3 className="text-lg font-bold leading-snug text-foreground">
                  {slide.title || "Untitled"}
                </h3>

                {/* Description */}
                {slide.subtitle && (
                  <p className="text-[15px] leading-snug text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}

                {/* Time & Date */}
                <p className="pt-1 text-xs font-medium text-muted-foreground">
                  {formatRelativeTime(slide.createdAt)}
                </p>
              </div>
            </Link>
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
