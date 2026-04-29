"use client"

import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { useSliders } from "@/lib/use-store-data"

export default function OffersPage() {
  const { sliders } = useSliders()

  return (
    <AppShell>
      <BackHeader title="Offers" />
      <div className="space-y-3 py-4 md:space-y-4 md:py-6">
        {sliders.map((slide) => (
          <Link key={slide.id} href={slide.link} className="relative block w-full overflow-hidden rounded-lg shadow-card transition-transform hover:-translate-y-0.5">
            <div className="relative flex aspect-16/8 w-full items-center overflow-hidden md:aspect-16/5" style={{ background: `linear-gradient(120deg, ${slide.bg}, ${slide.bg}cc 60%, var(--foreground) 120%)` }}>
              <div className="absolute bottom-8 left-5 z-10 md:bottom-12 md:left-10">
                <span className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-primary shadow-sm md:h-11 md:px-6 md:text-sm">Shop Now</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
