"use client"

import { useCategories } from "@/lib/use-store-data"
import { CategoryCard, MoreCategoriesCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories } = useCategories()
  const mobileMax = 6
  const showMore = categories.length > mobileMax
  const mobileCategories = categories.slice(0, showMore ? mobileMax - 1 : mobileMax)

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium text-foreground md:text-xl">Categories</h2>

      <div className="grid grid-cols-3 gap-2 md:hidden">
        {mobileCategories.map((c) => (
          <div key={c.id} className="w-full">
            <CategoryCard category={c} />
          </div>
        ))}
        {showMore && (
          <div className="w-full">
            <MoreCategoriesCard extras={categories.slice(mobileMax - 1)} />
          </div>
        )}
      </div>

      <div className="hidden gap-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory md:flex">
        {categories.map((c) => (
          <div key={c.id} className="w-27.5 shrink-0 snap-start lg:w-30">
            <CategoryCard category={c} />
          </div>
        ))}
      </div>
    </section>
  )
}
