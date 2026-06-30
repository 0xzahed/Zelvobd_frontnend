"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useCategories } from "@/src/hooks/api/useCategories"
import { CategoryCard } from "@/components/ui/category-card"
import { CategoriesSkeleton } from "@/components/ui/skeletons/categories-skeleton"

const ITEMS_PER_PAGE = 8
const COLS = 4

export function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories()
  const [page, setPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE))

  const goToPage = useCallback((idx: number) => {
    setPage(idx)
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: idx * containerRef.current.clientWidth, behavior: "smooth" })
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || totalPages <= 1) return

    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setPage(Math.min(totalPages - 1, Math.max(0, idx)))
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [totalPages])

  if (isLoading) return <CategoriesSkeleton />
  if (categories.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground md:text-xl">
        Featured{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}
        >
          Categories
        </span>
      </h2>

      <div
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ touchAction: "pan-x" }}
      >
        {Array.from({ length: totalPages }).map((_, pageIdx) => {
          const start = pageIdx * ITEMS_PER_PAGE
          const pageItems = categories.slice(start, start + ITEMS_PER_PAGE)
          const row1 = pageItems.slice(0, COLS)
          const row2 = pageItems.slice(COLS, COLS * 2)

          return (
            <div key={pageIdx} className="w-full shrink-0 snap-start">
              <div className="grid grid-cols-4 gap-y-3">
                {row1.map((c) => (
                  <div key={c.id} className="flex justify-center">
                    <CategoryCard category={c} />
                  </div>
                ))}
                {row2.map((c) => (
                  <div key={c.id} className="flex justify-center">
                    <CategoryCard category={c} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page
                  ? "w-5 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
