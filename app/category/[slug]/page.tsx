"use client"

import { notFound } from "next/navigation"
import { use } from "react"
import { useCategories, useSliders } from "@/lib/use-store-data"
import type { Slider } from "@/lib/types"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { SubCategoryCard } from "@/components/ui/category-card"
import { SliderBanner } from "@/components/ui/slider-banner"
import { SubCategoryProductsSections } from "@/components/category/sub-category-products-sections"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { categories, loaded: catsLoaded } = useCategories()
  const { sliders, loaded: slidersLoaded } = useSliders()

  const loaded = catsLoaded && slidersLoaded

  if (!loaded) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

  return (
    <AppShell>
      <BackHeader title={category.name} />
      <div className="space-y-5 py-4 md:space-y-6 md:py-6">
        {categorySlides.length > 0 && <SliderBanner slides={categorySlides} />}

        {/* Sub-categories */}
        {category.subCategories.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-medium text-foreground md:text-xl">Browse {category.name}</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8 md:gap-2">
              {category.subCategories.map((sc) => (
                <SubCategoryCard key={sc.id} categorySlug={category.slug} subCategory={sc} />
              ))}
            </div>
          </section>
        )}

        {/* Products by Subcategory */}
        {category.subCategories.length > 0 && (
          <SubCategoryProductsSections 
            categorySlug={category.slug} 
            subCategories={category.subCategories} 
          />
        )}
      </div>
    </AppShell>
  )
}
