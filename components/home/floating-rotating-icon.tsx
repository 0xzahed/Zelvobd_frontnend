"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowUp } from "lucide-react"

const SETTINGS_KEY = "ecomerce_settings"
const DEFAULT_INTERVAL_MS = 3000
const DEFAULT_IMAGES = ["/placeholder-user.jpg", "/demo-product-2.jpg", "/demo-product-3.jpg"]

type FloatingIconSettings = {
  floatingIconImages?: string[]
  floatingIconIntervalSec?: number
}

export function FloatingRotatingIcon() {
  const [images, setImages] = useState<string[]>([])
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MS)
  const [index, setIndex] = useState(0)
  const [showArrow, setShowArrow] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (!raw) {
        setImages(DEFAULT_IMAGES)
        return
      }
      const parsed = JSON.parse(raw) as FloatingIconSettings
      const nextImages = Array.isArray(parsed.floatingIconImages)
        ? parsed.floatingIconImages.filter(Boolean)
        : []
      setImages(nextImages.length > 0 ? nextImages : DEFAULT_IMAGES)
      if (typeof parsed.floatingIconIntervalSec === "number") {
        const ms = Math.max(1000, parsed.floatingIconIntervalSec * 1000)
        setIntervalMs(ms)
      }
    } catch {
      // noop
    }
  }, [])

  useEffect(() => {
    const updateArrow = () => {
      const threshold = window.innerHeight
      setShowArrow(window.scrollY >= threshold)
    }
    updateArrow()
    window.addEventListener("scroll", updateArrow, { passive: true })
    return () => window.removeEventListener("scroll", updateArrow)
  }, [])

  useEffect(() => {
    if (images.length === 0) return
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, intervalMs])

  const current = useMemo(() => images[index], [images, index])

  if (!current) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-10 md:right-8">
      <div className="relative flex items-center gap-2">
        {showArrow && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 text-primary" />
          </button>
        )}
        <div className="relative h-14 w-14">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border/60 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]">
            <Image src={current} alt="" fill sizes="56px" className="object-cover" unoptimized />
          </div>
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.65)] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
