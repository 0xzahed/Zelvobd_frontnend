"use client"

import { useRouter } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"
import { useCreateProduct } from "@/src/hooks/api/useProducts"

export default function NewProductPage() {
  const router = useRouter()
  const createMutation = useCreateProduct()

  function handleSave(
    product: Product,
    descriptionDelta: any,
    extraDescriptionDelta: any,
    categoryId: string,
    subCategoryId: string
  ) {
    createMutation.mutate(
      {
        product,
        descriptionDelta,
        extraDescriptionDelta,
        categoryId,
        subCategoryId,
      },
      {
        onSuccess: () => {
          router.push("/admin/products")
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">New Product</h1>
        <p className="text-sm text-muted-foreground">Add a new product to the catalog.</p>
      </header>
      <ProductForm 
        onSave={handleSave} 
        onCancel={() => router.push("/admin/products")} 
        isSaving={createMutation.isPending}
      />
    </div>
  )
}
