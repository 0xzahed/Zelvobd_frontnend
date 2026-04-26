"use client"

import { useCategories } from "@/lib/use-store-data"
import { CategoryCard, MoreCategoriesCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories, loaded } = useCategories()

  // Show up to 6 categories. If there are MORE than 6, replace the 6th tile
  // with a "More" tile linking to the rest.
  const hasOverflow = categories.length > 6
  const visible = hasOverflow ? categories.slice(0, 5) : categories.slice(0, 6)
  const extras = hasOverflow ? categories.slice(5) : []

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground md:text-xl">Categories</h2>

      {/* Mobile: 3-col grid; "More" tile only when there are more than 6 categories */}
      <div className="grid grid-cols-3 gap-3 md:hidden">
        {visible.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
        {hasOverflow && <MoreCategoriesCard extras={extras} />}
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
