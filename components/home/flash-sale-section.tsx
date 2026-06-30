"use client"

import { useEffect, useState, useRef } from "react"
import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function useCountdown(target: Date): TimeLeft {
  const calc = (): TimeLeft => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }
  const [left, setLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    setLeft(calc())
    const t = setInterval(() => setLeft(calc()), 1000)
    return () => clearInterval(t)
  }, [])
  return left
}

interface CampaignCardProps {
  logo?: ReactNode
  endTime: Date
  accentColor?: string
}

function CampaignCard({ logo, endTime, accentColor = "#f97316" }: CampaignCardProps) {
  const time = useCountdown(endTime)

  const boxes = [
    { value: time.days, unit: "d" },
    { value: time.hours, unit: "h" },
    { value: time.minutes, unit: "m" },
    { value: time.seconds, unit: "s" },
  ]

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: "220px",
        borderRadius: "14px",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex items-center gap-3 px-4 pb-6 pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          {logo ?? <FashionNightLogo />}
          <span
            style={{
              color: accentColor,
              fontSize: "11px",
              fontWeight: 600,
              lineHeight: 1.3,
              marginTop: "6px",
            }}
          >
            Campaign
            <br />
            starts in
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {boxes.map(({ value, unit }) => (
            <div
              key={unit}
              style={{
                background: "#1e2337",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                width: "44px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "0.01em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {String(value).padStart(2, "0")}
              {unit}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "10px",
          background: accentColor,
          borderRadius: "0 0 14px 14px",
        }}
      />
      <svg
        style={{
          position: "absolute",
          bottom: "2px",
          left: 0,
          width: "100%",
          height: "18px",
          pointerEvents: "none",
        }}
        viewBox="0 0 220 18"
        preserveAspectRatio="none"
      >
        <path
          d="M0,10 C40,0 80,18 120,8 C160,-2 200,14 220,6 L220,18 L0,18 Z"
          fill={accentColor}
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

function FashionNightLogo() {
  return (
    <div style={{ lineHeight: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="6" r="3" stroke="#111" strokeWidth="1.8" />
          <circle cx="6" cy="18" r="3" stroke="#111" strokeWidth="1.8" />
          <line x1="8.5" y1="8.5" x2="21" y2="21" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="8.5" y1="15.5" x2="21" y2="3" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontWeight: 900,
            fontSize: "13px",
            color: "#111",
            letterSpacing: "0.05em",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}
        >
          FASHION
        </span>
      </div>
      <span
        style={{
          fontWeight: 500,
          fontSize: "9px",
          color: "#555",
          letterSpacing: "0.25em",
          fontFamily: "Georgia, serif",
          marginLeft: "17px",
          display: "block",
        }}
      >
        NIGHT
      </span>
    </div>
  )
}

export function CampaignStrip() {
  const campaigns = [
    {
      endTime: new Date(Date.now() + 9 * 3600000 + 4 * 60000 + 42000),
      accentColor: "#f97316",
    },
    {
      endTime: new Date(Date.now() + 2 * 86400000 + 5 * 3600000),
      accentColor: "#8b5cf6",
      logo: (
        <div style={{ fontWeight: 900, fontSize: "15px", color: "#8b5cf6", fontFamily: "Georgia, serif" }}>
          HAPPO
        </div>
      ),
    },
    {
      endTime: new Date(Date.now() + 1 * 86400000 + 12 * 3600000),
      accentColor: "#06b6d4",
      logo: (
        <div style={{ fontWeight: 900, fontSize: "13px", color: "#06b6d4", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          MEGA
          <br />
          <span style={{ fontWeight: 500, fontSize: "9px", letterSpacing: "0.2em" }}>SALE</span>
        </div>
      ),
    },
  ]

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        padding: "12px 16px",
        scrollSnapType: "x mandatory",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {campaigns.map((c, i) => (
        <div key={i} style={{ scrollSnapAlign: "start" }}>
          <CampaignCard {...c} />
        </div>
      ))}
    </div>
  )
}

function CampaignSparkles() {
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "90px",
        pointerEvents: "none",
      }}
      viewBox="0 0 400 90"
      fill="none"
    >
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const len = i % 3 === 0 ? 22 : 14
        return (
          <line
            key={i}
            x1="200"
            y1="38"
            x2={200 + Math.cos(rad) * len}
            y2={38 + Math.sin(rad) * len}
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.85"
          />
        )
      })}
      <circle cx="200" cy="38" r="3.5" fill="white" opacity="0.95" />

      {[
        [60, 20, 6],
        [100, 12, 5],
        [150, 28, 4],
        [250, 28, 4],
        [300, 12, 5],
        [340, 20, 6],
        [80, 45, 4],
        [320, 45, 4],
        [130, 55, 3],
        [270, 55, 3],
      ].map(([cx, cy, r], i) => (
        <g key={`star-${i}`} transform={`translate(${cx},${cy})`}>
          <line x1="0" y1={-r} x2="0" y2={r} stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1={-r} y1="0" x2={r} y2="0" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1={-r * 0.6} y1={-r * 0.6} x2={r * 0.6} y2={r * 0.6} stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
          <line x1={r * 0.6} y1={-r * 0.6} x2={-r * 0.6} y2={r * 0.6} stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        </g>
      ))}
    </svg>
  )
}

const campaignProducts: Product[] = [
  {
    id: "campaign-1",
    name: "MYONE MY-1F5G Refrigerator - 16...",
    brand: "MYONE",
    price: 20300,
    cutPrice: 31100,
    discount: 0,
    rating: 0,
    reviews: 0,
    images: ["/demo-product-1.jpg"],
    features: [],
    description: "",
    isTrending: false,
    isFlashSale: true,
    stock: true,
    availability: true,
    whatsapp: "",
  },
  {
    id: "campaign-2",
    name: "Minister M-285S Frost Refrigerat...",
    brand: "Minister",
    price: 35280,
    cutPrice: 48280,
    discount: 0,
    rating: 0,
    reviews: 0,
    images: ["/demo-product-2.jpg"],
    features: [],
    description: "",
    isTrending: false,
    isFlashSale: true,
    stock: true,
    availability: true,
    whatsapp: "",
  },
  {
    id: "campaign-3",
    name: "Samsung RT28 Refrigerator 253L",
    brand: "Samsung",
    price: 42000,
    cutPrice: 55000,
    discount: 0,
    rating: 0,
    reviews: 0,
    images: ["/demo-product-3.jpg"],
    features: [],
    description: "",
    isTrending: false,
    isFlashSale: true,
    stock: true,
    availability: true,
    whatsapp: "",
  },
  {
    id: "campaign-4",
    name: "Walton WFE-2H5 Frost Refrigerator",
    brand: "Walton",
    price: 19900,
    cutPrice: 28500,
    discount: 0,
    rating: 0,
    reviews: 0,
    images: ["/demo-product-4.jpg"],
    features: [],
    description: "",
    isTrending: false,
    isFlashSale: true,
    stock: true,
    availability: true,
    whatsapp: "",
  },
]

export function CampaignProductGrid() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 5)
    const hasOverflow = el.scrollWidth > el.clientWidth + 5
    setShowRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth / 2
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
    setTimeout(checkScroll, 350)
  }

  return (
    <div
      style={{
        position: "relative",
        padding: "48px 12px 20px",
        background: "linear-gradient(45deg, #d7f540, #03204f)",
        borderRadius: "16px",
        borderTop: "4px solid #22c55e",
        overflow: "hidden",
        margin: "0 0 12px",
      }}
    >
      <CampaignSparkles />

      <div className="relative">
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-white shadow-sm transition hover:border-primary hover:text-primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-white shadow-sm transition hover:border-primary hover:text-primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div ref={scrollRef} className="relative z-10 flex gap-1 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {campaignProducts.map((p) => (
            <div key={p.id} className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FlashSaleSection() {
  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-base font-semibold text-foreground md:text-xl">Flash <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}>Sale</span></h2>
      </div>
      <CampaignStrip />
    </section>
  )
}
