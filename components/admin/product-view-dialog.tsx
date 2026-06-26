"use client"

import Image from "next/image"
import { Loader2, PackageOpen } from "lucide-react"
import { formatBDT } from "@/lib/format"
import { useProductDetails } from "@/src/hooks/api/useProducts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ProductViewDialogProps = {
  productId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductViewDialog({
  productId,
  open,
  onOpenChange,
}: ProductViewDialogProps) {
  const { data: product, isLoading, isError } = useProductDetails(productId || "", {
    enabled: open && Boolean(productId),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[88dvh] overflow-y-auto sm:max-w-5xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-left">
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>Detailed admin view for this product.</DialogDescription>
        </DialogHeader>

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
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {product.images.length > 0 ? (
                    product.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border/70 bg-card"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 220px"
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-lg border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                      No product images available.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  <div
                    className="prose prose-sm mt-3 max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description || "<p>No description</p>" }}
                  />
                </div>

                {product.extraDescription && (
                  <div className="rounded-lg border border-border/70 bg-card p-4">
                    <h3 className="text-sm font-semibold text-foreground">Extra Description</h3>
                    <div
                      className="prose prose-sm mt-3 max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: product.extraDescription }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-foreground">{product.name}</h2>
                    <p className="text-sm text-muted-foreground">{product.brand || "No brand"}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                      {product.categoryName || "Uncategorized"}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                      {product.subCategoryName || "No subcategory"}
                    </span>
                    {product.isTrending && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
                        Trending
                      </span>
                    )}
                    {product.isFlashSale && (
                      <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-accent">
                        Flash Sale
                      </span>
                    )}
                    {product.isFreeDelivery && (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-success">
                        Free Delivery
                      </span>
                    )}
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-semibold text-foreground">{formatBDT(product.price)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cut Price</dt>
                      <dd className="font-semibold text-foreground">{formatBDT(product.cutPrice)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Weight</dt>
                      <dd className="font-medium text-foreground">{product.weight || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Material</dt>
                      <dd className="font-medium text-foreground">{product.material || "N/A"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Stock</dt>
                      <dd className="font-medium text-foreground">{product.stock ? "In stock" : "Out of stock"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Availability</dt>
                      <dd className="font-medium text-foreground">
                        {product.availability ? "Available" : "Unavailable"}
                      </dd>
                    </div>
                  </dl>

                  {product.video && (
                    <div className="mt-5 space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Product Video</h3>
                      <video
                        src={product.video}
                        controls
                        className="w-full rounded-lg border border-border/70 bg-black/90"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Variants</h3>
                  <div className="mt-3 space-y-3">
                    {(product.variants || []).length > 0 ? (
                      (product.variants || []).map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border/60 bg-background">
                            <Image
                              src={variant.image || "/placeholder.svg"}
                              alt={variant.color || product.name}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1 text-sm">
                            <p className="font-medium text-foreground">
                              {variant.color || "Default color"}
                              {variant.size ? ` / ${variant.size}` : ""}
                            </p>
                            <p className="text-muted-foreground">
                              Actual: {formatBDT(variant.actualPrice)} | Discounted:{" "}
                              {formatBDT(variant.discountedPrice)}
                            </p>
                            {variant.flashSalePrice != null && (
                              <p className="text-xs font-semibold text-accent">
                                Flash sale: {formatBDT(variant.flashSalePrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No variants available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
