"use client"

import Link from "next/link"
import Image from "next/image"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { useBanners } from "@/src/hooks/api/useBanners"
import { formatRelativeTime } from "@/lib/format"
import type { Slider } from "@/lib/types"
import { MessageSquare } from "lucide-react"

export default function OffersPage() {
  const { data: banners = [], isLoading } = useBanners()

  return (
    <AppShell>
      <BackHeader title="Offers" />

      <div className="mx-auto max-w-md space-y-0 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-muted-foreground text-sm">Loading offers...</span>
          </div>
        ) : banners.length > 0 ? (
          banners.map((slide: Slider) => (
            <Link
              key={slide.id}
              href={slide.link}
              className="flex gap-3 border-b border-border/30 px-4 py-4 transition-colors active:bg-muted/30"
            >
              {/* Icon badge */}
              <div className="shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-[15px] font-medium leading-snug text-foreground">
                  {slide.title || "Untitled"}
                </h3>
                {slide.subtitle && (
                  <p className="text-sm leading-snug text-muted-foreground line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}

                {/* Image card */}
                {slide.image && (
                  <div className="relative mt-1.5 aspect-[16/9] w-full overflow-hidden rounded-lg border border-border/20">
                    <Image
                      src={slide.image}
                      alt={slide.title || "Offer"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground pt-1">
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
