"use client"

import { use } from "react"
import { useProducts } from "@/lib/use-store-data"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { ProductCard } from "@/components/ui/product-card"

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = use(searchParams)
  const { products, loaded } = useProducts()

  const query = q.toLowerCase().trim()
  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.categorySlug?.includes(query) ||
          p.subCategorySlug?.includes(query),
      )
    : []

  if (!loaded) {
    return (
      <AppShell>
        <BackHeader title={q ? `Results for "${q}"` : "Search"} />
        <div className="flex min-h-[30vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <BackHeader title={q ? `Results for "${q}"` : "Search"} />
      <div className="py-4 md:py-6">
        {q && (
          <p className="mb-3 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "product" : "products"} found
          </p>
        )}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-10 text-center shadow-card">
            <p className="text-sm text-muted-foreground">
              {q ? "No products match your search." : "Start typing to find products, brands, and categories."}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
