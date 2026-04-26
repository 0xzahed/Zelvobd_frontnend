"use client"

import Link from "next/link"
import { ChevronRight, Sparkles } from "lucide-react"
import { useProducts } from "@/lib/use-store-data"
import { ProductCard } from "@/components/ui/product-card"

const MAX_NEW = 12

export function NewProductsSection() {
  const { products, loaded } = useProducts()

  // "New" = the most recently added products. Since items are appended to the
  // store, the tail of the array represents the newest ones.
  const newItems = [...products].reverse().slice(0, MAX_NEW)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#306FD7] md:h-6 md:w-6" />
          <h2 className="text-base font-bold text-foreground md:text-xl">New Products</h2>
        </div>
        <Link
          href="/new-products"
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#306FD7] md:text-xs"
        >
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {newItems.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
