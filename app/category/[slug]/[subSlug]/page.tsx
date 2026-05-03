"use client"

import { notFound } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { ProductCard } from "@/components/ui/product-card"
import { useCategories, useProducts } from "@/lib/use-store-data"

export default function SubCategoryPage({ params }: { params: { slug: string; subSlug: string } }) {
  const { categories } = useCategories()
  const { products } = useProducts()
  const { slug, subSlug } = params

  const category = categories.find((c) => c.slug === slug)
  if (!category) return notFound()
  const subCategory = category.subCategories.find((s) => s.slug === subSlug)
  if (!subCategory) return notFound()
  const items = products.filter((p) => p.categorySlug === slug && p.subCategorySlug === subSlug)

  return (
    <AppShell>
      <BackHeader title={subCategory.name} />
      <div className="py-4 md:py-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-medium text-foreground md:text-xl">{subCategory.name}</h2><span className="text-xs text-muted-foreground md:text-sm">{items.length} items</span></div>
        {items.length > 0 ? <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="rounded-2xl bg-card p-10 text-center"><p className="text-sm text-muted-foreground">No products in this sub-category yet.</p></div>}
      </div>
    </AppShell>
  )
}
