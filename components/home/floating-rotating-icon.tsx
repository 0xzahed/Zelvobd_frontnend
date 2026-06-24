"use client"

import { useEffect, useState } from "react"
import { ArrowUp, HelpCircle } from "lucide-react"

export function FloatingRotatingIcon() {
  const [showArrow, setShowArrow] = useState(false)

  useEffect(() => {
    const updateArrow = () => {
      const threshold = window.innerHeight
      setShowArrow(window.scrollY >= threshold)
    }
    updateArrow()
    window.addEventListener("scroll", updateArrow, { passive: true })
    return () => window.removeEventListener("scroll", updateArrow)
  }, [])

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
        <a
          href="tel:01744546898"
          className="grid h-14 w-14 place-items-center rounded-full border border-border/60 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
          aria-label="Call help"
        >
          <HelpCircle className="h-7 w-7 text-emerald-600" />
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.65)] animate-pulse" />
        </a>
      </div>
    </div>
  )
}
