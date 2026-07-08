"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"
import { ProductCardSkeleton } from "@/components/ui/skeletons/product-card-skeleton"

const MAX_PER_SUBCATEGORY = 8

interface SubCategoryProductsSectionsProps {
  categorySlug: string
  subCategories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function SubCategoryProductsSections({ categorySlug, subCategories }: SubCategoryProductsSectionsProps) {
  const { products, loaded } = useProducts()

  if (!loaded) {
    return (
      <div className="space-y-6 md:space-y-8">
        {subCategories.slice(0, 3).map((subCategory) => (
          <section key={subCategory.id} className="space-y-3">
            <div className="h-5 w-40 rounded bg-muted/60 animate-pulse" />
            <div className="flex gap-3 overflow-x-hidden pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[calc((100%-0.75rem)/2.2)] shrink-0 md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-3rem)/5)]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {subCategories.map((subCategory) => {
        const items = products
          .filter((p) => p.categorySlug === categorySlug && p.subCategorySlug === subCategory.slug)
          .slice(0, MAX_PER_SUBCATEGORY)

        if (items.length === 0) return null

        return (
          <section key={subCategory.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground md:text-xl">
                {subCategory.name}
              </h2>
              <Link
                href={`/category/${categorySlug}/${subCategory.slug}`}
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
