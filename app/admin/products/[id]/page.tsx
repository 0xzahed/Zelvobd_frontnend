"use client"

import { useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"
import { useAdminStore } from "@/lib/admin-store"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { products, updateProduct } = useAdminStore()

  const initial = useMemo(() => products.find((p) => p.id === id) || null, [products, id])

  function handleSave(product: Product) {
    updateProduct(product.id, product)
    router.push("/admin/products")
  }

  if (!initial) return <p className="text-sm text-muted-foreground">Product not found.</p>

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-semibold text-foreground">Edit product</h1></header>
      <ProductForm initial={initial} onSave={handleSave} onCancel={() => router.push("/admin/products")} />
    </div>
  )
}
