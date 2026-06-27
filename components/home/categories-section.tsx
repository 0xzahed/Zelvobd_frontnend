"use client"

import { useRef } from "react"
import { useCategories } from "@/lib/use-store-data"
import { CategoryCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories } = useCategories()
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  const syncScroll = (source: "row1" | "row2") => {
    if (syncing.current) return
    syncing.current = true
    const src = source === "row1" ? row1Ref.current : row2Ref.current
    const dst = source === "row1" ? row2Ref.current : row1Ref.current
    if (src && dst) {
      dst.scrollLeft = src.scrollLeft
    }
    requestAnimationFrame(() => { syncing.current = false })
  }

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

      {/* Desktop - horizontal scroll like product cards */}
      <div className="hidden md:flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map((c) => (
          <div key={c.id} className="w-[100px] shrink-0">
            <CategoryCard category={c} />
          </div>
        ))}
      </div>

      {/* Mobile - 2 row marquee, synced scroll */}
      <div className="md:hidden">
        <div
          ref={row1Ref}
          onScroll={() => syncScroll("row1")}
          className="flex gap-2 overflow-x-auto no-scrollbar"
        >
          {categories.filter((_, i) => i % 2 === 0).map((c) => (
            <div key={c.id} className="w-[80px] shrink-0">
              <CategoryCard category={c} />
            </div>
          ))}
        </div>
        <div
          ref={row2Ref}
          onScroll={() => syncScroll("row2")}
          className="flex gap-2 overflow-x-auto no-scrollbar mt-2"
          style={{ paddingLeft: "44px" }}
        >
          {categories.filter((_, i) => i % 2 === 1).map((c) => (
            <div key={c.id} className="w-[80px] shrink-0">
              <CategoryCard category={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
