import { BASE_URL } from "@/src/api/_shared/client"
import { mapProduct } from "@/src/api/_shared/mappers"
import type { Product } from "@/lib/types"

export const getStorefrontProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${BASE_URL}/products/slug/${slug}`, {
      method: "GET",
      next: { revalidate: 60 }, // optional: cache for 60 seconds
      signal: AbortSignal.timeout(10_000),
    })

    const payload = await response.json()

    if (!response.ok || payload?.status === false) {
      return null
    }

    return mapProduct(payload.data)
  } catch (error) {
    console.error("Failed to fetch product by slug:", error)
    return null
  }
}
