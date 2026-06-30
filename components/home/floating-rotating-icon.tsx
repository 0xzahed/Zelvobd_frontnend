"use client"

import { useEffect, useState } from "react"
import { ArrowUp, Headset } from "lucide-react"

export function FloatingRotatingIcon() {
  const [showArrow, setShowArrow] = useState(false)
  const [expanded, setExpanded] = useState(false)

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
    setExpanded(false)
    const expandTimer = setTimeout(() => setExpanded(true), 1000)
    const retractTimer = setTimeout(() => setExpanded(false), 6000)
    return () => {
      clearTimeout(expandTimer)
      clearTimeout(retractTimer)
    }
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
          className="animate-float group flex items-center overflow-hidden rounded-full bg-[linear-gradient(45deg,#052F84,#7BA4F7)] transition-transform hover:scale-105"
          aria-label="Contact Us"
        >
          <span
            className={`flex h-12 items-center whitespace-nowrap text-sm font-semibold text-white transition-all duration-500 ease-out ${expanded ? "max-w-[100px] px-3 opacity-100" : "max-w-0 px-0 opacity-0"}`}
          >
            Contact Us
          </span>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center">
            <Headset className="h-5 w-5 text-white" />
          </div>
        </a>
        <FloatStyles />
      </div>
    </div>
  )
}

function FloatStyles() {
  return (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>
  )
}
