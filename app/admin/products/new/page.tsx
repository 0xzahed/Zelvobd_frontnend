"use client"

import { useRouter } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"
import { useAdminStore } from "@/lib/admin-store"

export default function NewProductPage() {
  const router = useRouter()
  const { addProduct } = useAdminStore()

  function handleSave(product: Product) {
    addProduct(product)
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
