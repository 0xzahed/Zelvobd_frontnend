"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCategories, useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

const MAX_PER_CATEGORY = 8

export function CategoryProductsSections() {
  const { categories, loaded: catsLoaded } = useCategories()
  const { products, loaded: prodLoaded } = useProducts()

  return (
    <div className="space-y-6 md:space-y-8">
      {categories.map((category) => {
        const items = products
          .filter((p) => p.categorySlug === category.slug)
          .slice(0, MAX_PER_CATEGORY)

        return (
          <section key={category.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground md:text-xl">
                {category.name}
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
              >
                See All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
              {items.map((p) => (
                <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
