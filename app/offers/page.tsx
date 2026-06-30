"use client"

import Link from "next/link"
import Image from "next/image"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { useBanners } from "@/src/hooks/api/useBanners"
import type { Slider } from "@/lib/types"
import { OfferSkeleton } from "@/components/ui/skeletons/offer-skeleton"

function formatDateTime(dateString?: string) {
  if (!dateString) return { time: "", date: "" }
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return { time: "", date: "" }
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  return { time, date }
}

export default function OffersPage() {
  const { data: banners = [], isLoading } = useBanners()

  return (
    <AppShell>
      <BackHeader title="Offers" />

      <div className="mx-auto max-w-md space-y-4 py-4">
        {isLoading ? (
          <>
            <OfferSkeleton />
            <OfferSkeleton />
            <OfferSkeleton />
          </>
        ) : banners.length > 0 ? (
          banners.map((slide: Slider) => (
            <Link
              key={slide.id}
              href={slide.link}
              className="block rounded-lg border border-border/30 bg-card overflow-hidden transition-all hover:border-border/50 active:scale-[0.995]"
            >
              {/* Image on top */}
              {slide.image && (
                <div className="relative aspect-video w-full overflow-hidden rounded-b-lg">
                  <Image
                    src={slide.image}
                    alt={slide.title || "Offer"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-3 space-y-1.5">
                {/* Title */}
                <h3 className="text-base font-semibold leading-snug text-foreground">
                  {slide.title || "Untitled"}
                </h3>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                    {slide.subtitle}
                  </p>
                )}

                {/* Time & Date */}
                {(() => {
                  const { time, date } = formatDateTime(slide.createdAt)
                  if (!time && !date) return null
                  return (
                    <div className="flex items-center gap-2 pt-1 text-xs font-medium text-muted-foreground">
                      {time && <span>{time}</span>}
                      {date && <span>{date}</span>}
                    </div>
                  )
                })()}
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-lg font-medium text-foreground">
              No active offers right now
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}