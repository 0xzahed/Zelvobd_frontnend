"use client"

import { notFound } from "next/navigation"
import { use } from "react"
import { useProducts } from "@/lib/use-store-data"
import { AppShell } from "@/components/layout/app-shell"
import { ProductDetail } from "@/components/product/product-detail"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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

  const product = products.find((p) => p.id === id)
  if (!product) notFound()

  return (
    <AppShell>
      <ProductDetail product={product} />
    </AppShell>
  )
}
