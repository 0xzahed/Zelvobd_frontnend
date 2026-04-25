"use client"

import { useRouter } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"

export default function NewProductPage() {
  const router = useRouter()

  function handleSave(product: Product) {
    try {
      const raw = localStorage.getItem("ecomerce_products")
      const existing: Product[] = raw ? JSON.parse(raw) : []
      localStorage.setItem("ecomerce_products", JSON.stringify([product, ...existing]))
    } catch {
      // noop
    }
    router.push("/admin/products")
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">New product</h1>
        <p className="text-sm text-muted-foreground">Add a new product to the catalog.</p>
      </header>
      <ProductForm onSave={handleSave} onCancel={() => router.push("/admin/products")} />
    </div>
  )
}
