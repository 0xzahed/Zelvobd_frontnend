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

      <div className="mx-auto max-w-md space-y-3 py-3">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-border/50 bg-card">
            <span className="text-muted-foreground text-sm">Loading offers...</span>
          </div>
        ) : banners.length > 0 ? (
          banners.map((slide: Slider) => (
            <Link
              key={slide.id}
              href={slide.link}
              className="block rounded-[8px] border border-border/60 bg-card p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.995]"
            >
              <div className="min-w-0 space-y-2">
                <h3 className="text-base font-semibold leading-snug text-foreground">
                  {slide.title || "Untitled"}
                </h3>
                {slide.subtitle && (
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}

                {/* Image card */}
                {slide.image && (
                  <div className="relative mt-1 aspect-[16/9] w-full overflow-hidden rounded-[8px] border border-border/30">
                    <Image
                      src={slide.image}
                      alt={slide.title || "Offer"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

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
