import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product/product-detail"
import { getStorefrontProductBySlug } from "@/src/api/products/getStorefrontProductBySlug"
import { FloatingRotatingIcon } from "@/components/home/floating-rotating-icon"

export default async function ProductDetailPage(props: {
  params: Promise<{
    categorySlug: string
    subCategorySlug: string
    productSlug: string
    variantId?: string[]
  }>
}) {
  const params = await props.params;

  // 1. Fetch product by slug directly from API
  const product = await getStorefrontProductBySlug(params.productSlug)

  if (!product) {
    notFound()
  }

  const initialVariantId = params.variantId?.[0] || undefined;

  // 2. Validate that the URL segments match the product
  // Note: the backend uses subCategoryName, categorySlug, etc. 
  // if you want to strictly validate URL structure vs data, you could do it here.
  
  return (
    <main className="min-h-screen bg-white px-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <ProductDetail product={product} initialVariantId={initialVariantId} />
      </div>
      <FloatingRotatingIcon />
    </main>
  )
}
