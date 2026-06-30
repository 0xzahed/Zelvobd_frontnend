"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { getProducts } from "@/src/api/products/getProducts"
import { mapProduct } from "@/src/api/_shared/mappers"
import { ProductCard } from "@/components/ui/product-card"
import type { Product } from "@/lib/types"

const MAX_NEW = 9
let newProductsCache: Product[] | null = null
let newProductsInFlight: Promise<Product[]> | null = null

export function NewProductsSection() {
  const [newItems, setNewItems] = useState<Product[]>([])
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

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        if (newProductsCache) {
          if (!cancelled) setNewItems(newProductsCache)
          return
        }
        if (!newProductsInFlight) {
          newProductsInFlight = getProducts({ limit: MAX_NEW, sortBy: "createdAt", sortOrder: "desc" })
            .then((res) => (res?.data?.products || []).map(mapProduct) as Product[])
            .finally(() => {
              newProductsInFlight = null
            })
        }
        const products = await newProductsInFlight
        newProductsCache = products
        if (!cancelled) setNewItems(products)
      } catch {
        if (!cancelled) setNewItems([])
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth / 2
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
    setTimeout(checkScroll, 350)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground md:text-xl">
            New <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}>Products</span>
          </h2>
        </div>
        <Link
          href="/new-products"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

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

        <div ref={scrollRef} className="flex gap-1 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {newItems.slice(0, 8).map((p) => (
          <div key={p.id} className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]">
            <ProductCard product={p} />
          </div>
        ))}
        {newItems.length > 8 && (
          <div className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]">
            <Link
              href="/new-products"
              className="group flex h-full items-center justify-center rounded-sm border border-border/60 bg-card p-3 shadow-[0_0_14px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-md"
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                More
                <span className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-white text-foreground shadow-sm transition group-hover:border-primary group-hover:text-primary">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
    </section>
  )
}
