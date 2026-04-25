"use client"

import { notFound } from "next/navigation"
import { use } from "react"
import { useCategories, useProducts, useSliders } from "@/lib/use-store-data"
import type { Slider } from "@/lib/types"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { SubCategoryTile } from "@/components/category/sub-category-tile"
import { ProductCard } from "@/components/ui/product-card"
import { SliderBanner } from "@/components/ui/slider-banner"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { categories, loaded: catsLoaded } = useCategories()
  const { products, loaded: prodsLoaded } = useProducts()
  const { sliders, loaded: slidersLoaded } = useSliders()

  const loaded = catsLoaded && prodsLoaded && slidersLoaded

  if (!loaded) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B6CF4] border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  // Admin-configurable: category.slider is an optional list of slider ids
  const categorySlides = (category.slider ?? [])
    .map((id) => sliders.find((s) => s.id === id))
    .filter(Boolean) as Slider[]

  const items = products.filter((p) => p.categorySlug === slug)

  return (
    <AppShell>
      <BackHeader title={category.name} />
      <div className="space-y-5 py-4 md:space-y-6 md:py-6">
        {categorySlides.length > 0 && <SliderBanner slides={categorySlides} />}

        {/* Sub-categories */}
        {category.subCategories.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground md:text-xl">Browse {category.name}</h2>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-8 md:gap-2">
              {category.subCategories.map((sc) => (
                <SubCategoryTile key={sc.id} categorySlug={category.slug} sub={sc} />
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground md:text-xl">All Products</h2>
            <span className="text-xs text-muted-foreground md:text-sm">{items.length} items</span>
          </div>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No products in this category yet.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
