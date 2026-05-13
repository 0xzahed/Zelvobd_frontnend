"use client"

import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { useCategories } from "@/lib/use-store-data"
import type { Slider, SubCategory } from "@/lib/types"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { SubCategoryCard } from "@/components/ui/category-card"
import { SliderBanner } from "@/components/ui/slider-banner"
import { SubCategoryProductsSections } from "@/components/category/sub-category-products-sections"
import { getBannersByCategory } from "@/src/api/banner/getBannersByCategory"
import { getSubCategories } from "@/src/api/categoryApi"
import { mapBanner, mapSubCategory } from "@/src/api/_shared/mappers"

export default function CategoryPage(props: { params: any }) {
  const [slug, setSlug] = useState<string>("")
  
  useEffect(() => {
    if (props.params && typeof props.params.then === "function") {
      props.params.then((res: any) => setSlug(res.slug))
    } else if (props.params) {
      setSlug(props.params.slug)
    }
  }, [props.params])

  const { categories, loaded: catsLoaded } = useCategories()
  
  const [categorySlides, setCategorySlides] = useState<Slider[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [pageDataLoaded, setPageDataLoaded] = useState(false)

  const category = slug ? categories.find((c) => c.slug === slug) : undefined

  useEffect(() => {
    if (!catsLoaded || !slug) return
    if (!category) {
      setPageDataLoaded(true)
      return
    }

    let cancelled = false
    const loadData = async () => {
      try {
        const [bannersRes, subsRes] = await Promise.all([
          getBannersByCategory(category.id).catch(() => null),
          getSubCategories({ categoryId: category.id, limit: 100 }).catch(() => null)
        ])
        
        if (!cancelled) {
          setCategorySlides((bannersRes?.data || []).map(mapBanner))
          setSubCategories((subsRes?.data?.subCategories || []).map(mapSubCategory))
          setPageDataLoaded(true)
        }
      } catch (err) {
         if (!cancelled) setPageDataLoaded(true)
      }
    }
    
    loadData()
    return () => { cancelled = true }
  }, [category, catsLoaded, slug])

  // Don't render until we have the slug and data
  if (!slug) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  const loaded = catsLoaded && pageDataLoaded

  if (!loaded) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!category) return notFound()

  return (
    <AppShell>
      <BackHeader title={category.name} />
      <div className="space-y-5 py-4 md:space-y-6 md:py-6">
        {categorySlides.length > 0 && <SliderBanner slides={categorySlides} />}

        {/* Sub-categories */}
        {subCategories.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">Browse {category.name}</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8 md:gap-2">
              {subCategories.map((sc) => (
                <SubCategoryCard key={sc.id} categorySlug={category.slug} subCategory={sc} />
              ))}
            </div>
          </section>
        )}

        {/* Products by Subcategory */}
        {subCategories.length > 0 && (
          <SubCategoryProductsSections 
            categorySlug={category.slug} 
            subCategories={subCategories} 
          />
        )}
      </div>
    </AppShell>
  )
}
