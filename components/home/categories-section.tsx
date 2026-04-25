"use client"

import { useCategories } from "@/lib/use-store-data"
import { CategoryCard, MoreCategoriesCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories, loaded } = useCategories()

  const visible = categories.slice(0, 5)
  const extras = categories.slice(5)

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground md:text-xl">Categories</h2>

      {/* Mobile: 3-col grid with "More" tile */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        {visible.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
        {extras.length > 0 ? (
          <MoreCategoriesCard extras={extras} />
        ) : (
          categories.slice(5, 6).map((c) => <CategoryCard key={c.id} category={c} />)
        )}
      </div>

      {/* Desktop: all categories in one horizontal line (scrollable if overflowing) */}
      <div className="hidden md:block">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {categories.map((c) => (
            <div key={c.id} className="w-[110px] shrink-0 lg:w-[120px]">
              <CategoryCard category={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
