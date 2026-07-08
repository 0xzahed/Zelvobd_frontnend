"use client"

import { TrendingUp } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { ProductCard } from "@/components/ui/product-card"
import { ProductGridSkeleton } from "@/components/ui/skeletons/product-grid-skeleton"

export default function TrendingPage() {
  const { products, loaded } = useProducts()

  if (!loaded) {
    return (
      <AppShell>
        <div className="py-4 md:py-6">
          <ProductGridSkeleton />
        </div>
      </AppShell>
    )
  }

  const items = products.filter((p) => p.isTrending)

  return (
    <AppShell>
      <BackHeader title="Trending Products" />
      <div className="space-y-4 py-4 md:space-y-6 md:py-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary md:h-6 md:w-6" />
            <h2 className="text-base font-medium text-foreground md:text-xl">All Trending Products</h2>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No trending products yet.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
