"use client"

import { Sparkles } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"
import { ProductCard } from "@/components/ui/product-card"

export default function NewProductsPage() {
  const { products, loaded } = useProducts()

  if (!loaded) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B6CF4] border-t-transparent" />
        </div>
      </AppShell>
    )
  }

  // Newest first — products are appended, so reverse the list.
  const items = [...products].reverse()

  return (
    <AppShell>
      <BackHeader title="New Products" />
      <div className="space-y-4 py-4 md:space-y-6 md:py-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3B6CF4] md:h-6 md:w-6" />
              <h2 className="text-base font-bold text-foreground md:text-xl">All New Products</h2>
            </div>
            <span className="text-xs text-muted-foreground md:text-sm">{items.length} items</span>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No products available yet.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
