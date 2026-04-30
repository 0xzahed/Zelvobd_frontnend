"use client"

import { useCategories } from "@/lib/use-store-data"
import { CategoryCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories } = useCategories()

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium text-foreground md:text-xl">Categories</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {categories.map((c) => (
          <div key={c.id} className="w-[calc((100%-1rem)/3)] shrink-0 snap-start md:w-27.5 lg:w-30">
            <CategoryCard category={c} />
          </div>
        ))}
      </div>
    </section>
  )
}
