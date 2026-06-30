"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useCategories } from "@/src/hooks/api/useCategories"
import { useProducts } from "@/src/hooks/api/useProducts"
import { ProductCard } from "@/components/ui/product-card"
import { ProductSliderSkeleton } from "@/components/ui/skeletons/product-slider-skeleton"

const MAX_PER_CATEGORY = 8

function CategorySection({
  category,
  items,
}: {
  category: { id: string; slug: string; name: string }
  items: any[]
}) {
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

  const visibleItems = items.slice(0, MAX_PER_CATEGORY)
  const words = category.name.split(" ")

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground md:text-xl">
          {words.length >= 2 ? (
            <>
              {words[0]}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
              >
                {words[1]}
              </span>{" "}
              {words.slice(2).join(" ")}
            </>
          ) : (
            category.name
          )}
        </h2>
        <Link
          href={`/category/${category.slug}`}
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
          {visibleItems.map((p) => (
            <div key={p.id} className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]">
              <ProductCard product={p} />
            </div>
          ))}
          {items.length > MAX_PER_CATEGORY && (
            <div className="w-[calc((100%-0.25rem)/2)] shrink-0 md:w-[calc((100%-0.75rem)/4)] lg:w-[calc((100%-1rem)/5)]">
              <Link
                href={`/category/${category.slug}`}
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

export function CategoryProductsSections() {
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
  const { data: products = [], isLoading: isLoadingProducts } = useProducts()
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof products>()
    for (const product of products) {
      const key = product.categorySlug || ""
      if (!key) continue
      const list = grouped.get(key)
      if (list) {
        list.push(product)
      } else {
        grouped.set(key, [product])
      }
    }
    return grouped
  }, [products])

  if (isLoadingCategories || isLoadingProducts) {
    return (
      <div className="space-y-6 md:space-y-8">
        <ProductSliderSkeleton title="Loading" highlight="Category" />
        <ProductSliderSkeleton title="Loading" highlight="Category" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {categories.map((category) => {
        const items = productsByCategory.get(category.slug) || []
        if (items.length === 0) return null
        return <CategorySection key={category.id} category={category} items={items} />
      })}
    </div>
  )
}
