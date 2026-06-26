"use client"

import { useCategories } from "@/lib/use-store-data"
import { CategoryCard, MoreCategoriesCard } from "@/components/ui/category-card"

export function CategoriesSection() {
  const { categories } = useCategories()
  const mobileMax = 8
  const showMore = categories.length > mobileMax
  const mobileCategories = categories.slice(0, showMore ? mobileMax - 1 : mobileMax)

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground md:text-xl">Featured <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(45deg, #052F84, #7BA4F7)" }}>Categories</span></h2>

      <div className="grid grid-cols-4 gap-2 md:hidden">
        {mobileCategories.map((c) => (
          <div key={c.id} className="mx-auto w-[90%]">
            <CategoryCard category={c} />
          </div>
        ))}
        {showMore && (
          <div className="mx-auto w-[90%]">
            <MoreCategoriesCard extras={categories.slice(mobileMax - 1)} />
          </div>
        )}
      </div>

      <div className="hidden gap-1 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory md:flex">
        {categories.map((c) => (
          <div key={c.id} className="w-18 shrink-0 snap-start lg:w-20">
            <CategoryCard category={c} />
          </div>
        ))}
      </div>
    </section>
  )
}
