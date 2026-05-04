import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product/product-detail"
import { getStorefrontProductBySlug } from "@/src/api/products/getStorefrontProductBySlug"

export default async function ProductDetailPage(props: {
  params: Promise<{
    categorySlug: string
    subCategorySlug: string
    productSlug: string
    variantId: string
  }>
}) {
  const params = await props.params;

  // 1. Fetch product by slug directly from API
  const product = await getStorefrontProductBySlug(params.productSlug)

  if (!product) {
    notFound()
  }

  // 2. Validate that the URL segments match the product
  // Note: the backend uses subCategoryName, categorySlug, etc. 
  // if you want to strictly validate URL structure vs data, you could do it here.
  
  return (
    <main className="min-h-screen bg-background md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ProductDetail product={product} initialVariantId={params.variantId} />
      </div>
    </main>
  )
}
