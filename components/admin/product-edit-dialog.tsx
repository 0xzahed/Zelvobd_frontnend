"use client"

import { Loader2, PackageOpen, X } from "lucide-react"
import { useProductDetails, useUpdateProduct } from "@/src/hooks/api/useProducts"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import type { Product } from "@/lib/types"

type ProductEditDialogProps = {
  productId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductEditDialog({
  productId,
  open,
  onOpenChange,
}: ProductEditDialogProps) {
  const { data: product, isLoading, isError } = useProductDetails(productId || "", {
    enabled: open && Boolean(productId),
  })

  const updateMutation = useUpdateProduct()

  const handleUpdate = (
    updatedProduct: Product,
    descriptionDelta: any,
    extraDescriptionDelta: any,
    categoryId: string,
    subCategoryId: string
  ) => {
    if (!productId) return

    updateMutation.mutate(
      {
        id: productId,
        product: updatedProduct,
        descriptionDelta,
        extraDescriptionDelta,
        categoryId,
        subCategoryId,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="flex h-dvh w-screen max-w-[100vw]! flex-col overflow-hidden rounded-none border-0 p-0 sm:h-auto sm:max-h-[85dvh] sm:max-w-5xl! sm:rounded-2xl sm:border sm:border-border/60 sm:p-6 sm:shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold sm:text-xl">Edit Product</DialogTitle>
            <DialogDescription className="hidden text-sm sm:block">Modify the details of this product.</DialogDescription>
          </DialogHeader>
          <DialogClose
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full bg-muted/40 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-0 sm:pt-6">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading product details...</p>
            </div>
          ) : isError || !product ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <PackageOpen className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Product details could not be loaded.
              </p>
            </div>
          ) : (
            <ProductForm
              initial={product}
              onSave={handleUpdate}
              onCancel={() => onOpenChange(false)}
              isSaving={updateMutation.isPending}
              variant="plain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
