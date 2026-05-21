"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useCategories, useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

const MAX_PER_CATEGORY = 12

export function CategoryProductsSections() {
  const { categories } = useCategories()
  const { products } = useProducts()
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

  return (
    <div className="space-y-6 md:space-y-8">
      {categories.map((category) => {
        const items = productsByCategory.get(category.slug) || []
        if (items.length === 0) return null
        
        const visibleItems = items.slice(0, MAX_PER_CATEGORY)

        return (
          <section key={category.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground md:text-xl">
                {(() => {
                  const words = category.name.split(" ");
                  if (words.length >= 2) {
                    return (
                      <>
                        {words[0]} <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(45deg, #d7f540, #03204f)" }}>{words[1]}</span> {words.slice(2).join(" ")}
                      </>
                    )
                  }
                  return category.name;
                })()}
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary md:text-xs"
              >
                See All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
              {visibleItems.map((p) => (
                <div key={p.id} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
                  <ProductCard product={p} />
                </div>
              ))}
              {items.length > MAX_PER_CATEGORY && (
                <div className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
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
          </section>
        )
      })}
    </div>
  )
}
