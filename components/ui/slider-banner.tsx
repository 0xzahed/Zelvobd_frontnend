"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Slider } from "@/lib/types"
import { cx } from "@/lib/format"

export function SliderBanner({ slides }: { slides: Slider[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000)
    return () => clearInterval(t)
  }, [slides.length])

  // Simple swipe support
  const [startX, setStartX] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => setStartX(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX === null) return
    const dx = e.changedTouches[0].clientX - startX
    if (Math.abs(dx) > 40) {
      setIndex((i) => (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length)
    }
    setStartX(null)
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg shadow-card"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex aspect-[16/8] w-full shrink-0 items-center overflow-hidden bg-[#1A1A2E] md:aspect-[16/5]"
          >
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(120deg, ${slide.bg}, ${slide.bg}cc 60%, #1A1A2E 120%)`,
                }}
              />
            )}
            <div className="absolute bottom-8 left-5 z-10 md:bottom-12 md:left-10">
              <Link
                href={slide.link}
                className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[13px] font-semibold text-[#3B6CF4] shadow-sm md:h-11 md:px-6 md:text-sm"
              >
                Shop Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-1.5 md:bottom-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cx(
              "h-1.5 rounded-full transition-all",
              index === i ? "w-5 bg-white" : "w-1.5 bg-white/60",
            )}
          />
        ))}
      </div>
    </div>
  )
}
