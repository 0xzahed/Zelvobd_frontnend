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
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#306FD7] md:text-xs"
              >
                See All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
