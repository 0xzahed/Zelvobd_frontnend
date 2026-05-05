import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"
import { notify } from "@/lib/notify"

export type TrendingAdminResponse = {
  id: string
  title: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  sourceCounts: {
    categories: number
    subCategories: number
    products: number
    excludedProducts: number
  }
  trendingProductCount: number
  sources: {
    categories: Array<{ id: string; categoryId: string; category: { id: string; title: string } }>
    subCategories: Array<{
      id: string
      subCategoryId: string
      subCategory: { id: string; title: string; categoryId: string; category: { id: string; title: string } }
    }>
    products: Array<{
      id: string
      productId: string
      product: { id: string; title: string; slug: string; isTrending: boolean; category: { id: string; title: string } | null; subCategory: { id: string; title: string } | null }
    }>
    excludedProducts: Array<{
      id: string
      productId: string
      product: { id: string; title: string; slug: string; category: { id: string; title: string } | null; subCategory: { id: string; title: string } | null }
    }>
  }
}

export function useTrendingAdmin() {
  return useQuery({
    queryKey: ["trending-admin"],
    queryFn: async (): Promise<TrendingAdminResponse> => {
      const res = await adminFetch(`${BASE_URL}/trending/admin`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch trending config")
      return data.data
    },
  })
}

export function useUpdateTrendingCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { title?: string; isActive?: boolean }) => {
      const res = await adminFetch(`${BASE_URL}/trending/campaign`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update campaign")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trending-admin"] })
      notify.success("Trending campaign updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update campaign")
    },
  })
}

export function useUpdateTrendingProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { addProductIds?: string[]; removeProductIds?: string[] }) => {
      const res = await adminFetch(`${BASE_URL}/trending/products`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update products")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trending-admin"] })
      notify.success("Trending products updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update products")
    },
  })
}
