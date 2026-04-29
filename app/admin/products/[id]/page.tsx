"use client"

import { useRouter, useParams } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import type { Product } from "@/lib/types"
import { useProductDetails, useUpdateProduct } from "@/src/hooks/api/useProducts"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  
  const { data: initial, isLoading, isError } = useProductDetails(id, { enabled: Boolean(id) })
  const updateMutation = useUpdateProduct()

  function handleSave(
    product: Product,
    descriptionDelta: any,
    extraDescriptionDelta: any,
    categoryId: string,
    subCategoryId: string
  ) {
    updateMutation.mutate(
      {
        id,
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

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    )
  }

  if (isError || !initial) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Failed to load product or product not found.</p>
        <button 
          onClick={() => router.push("/admin/products")}
          className="mt-4 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary/70"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update the details of the existing product.</p>
      </header>
      <ProductForm 
        initial={initial} 
        onSave={handleSave} 
        onCancel={() => router.push("/admin/products")} 
        isSaving={updateMutation.isPending}
      />
    </div>
  )
}
