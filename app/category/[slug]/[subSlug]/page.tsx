"use client"

import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { ProductCard } from "@/components/ui/product-card"
import { ProductGridSkeleton } from "@/components/ui/skeletons/product-grid-skeleton"
import { useCategories, useProducts } from "@/lib/use-store-data"
import { FloatingRotatingIcon } from "@/components/home/floating-rotating-icon"
import { viewContent } from "@/lib/pixel"

export default function SubCategoryPage({ params }: { params: any }) {
  const [slug, setSlug] = useState("")
  const [subSlug, setSubSlug] = useState("")

  useEffect(() => {
    if (params && typeof params.then === "function") {
      params.then((res: any) => {
        setSlug(res.slug)
        setSubSlug(res.subSlug)
      })
    } else if (params) {
      setSlug(params.slug)
      setSubSlug(params.subSlug)
    }
  }, [params])

  const { categories, loaded: catsLoaded } = useCategories()
  const { products, loaded: prodsLoaded } = useProducts()

  const category = catsLoaded ? categories.find((c) => c.slug === slug) : undefined
  const subCategory = category ? category.subCategories.find((s) => s.slug === subSlug) : undefined

  useEffect(() => {
    if (subCategory) {
      viewContent({
        productId: subCategory.id,
        productName: subCategory.name,
        contentType: 'product_group'
      })
    }
  }, [subCategory?.id])

  if (!slug || !subSlug) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  if (!catsLoaded || !prodsLoaded) {
    return (
      <AppShell>
        <BackHeader title="" />
        <div className="py-4 md:py-6">
          <ProductGridSkeleton />
        </div>
      </AppShell>
    )
  }

  if (!category) return notFound()
  if (!subCategory) return notFound()

  const items = products.filter((p) => p.categorySlug === slug && p.subCategorySlug === subSlug)

  return (
    <AppShell>
      <BackHeader title={subCategory.name} />
      <div className="py-4 md:py-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-foreground md:text-xl">{subCategory.name}</h2><span className="text-xs text-muted-foreground md:text-sm">{items.length} items</span></div>
        {items.length > 0 ? <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="rounded-2xl bg-card p-10 text-center"><p className="text-sm text-muted-foreground">No products in this sub-category yet.</p></div>}
      </div>
      <FloatingRotatingIcon />
    </AppShell>
  )
}
