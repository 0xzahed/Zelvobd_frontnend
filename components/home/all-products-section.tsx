"use client"

import { Package } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

export function AllProductsSection() {
  const { products, loaded } = useProducts()

  if (!loaded) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[#3B6CF4] md:h-6 md:w-6" />
          <h2 className="text-base font-bold text-foreground md:text-xl">All Products</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
