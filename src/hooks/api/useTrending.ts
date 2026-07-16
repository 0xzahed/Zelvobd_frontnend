import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTrendingAdmin, updateTrendingCampaign, updateTrendingProducts } from "@/src/api/trendingApi"
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
      const res = await getTrendingAdmin()
      return res.data
    },
  })
}

export function useUpdateTrendingCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { title?: string; isActive?: boolean }) => {
      const res = await updateTrendingCampaign(payload)
      return res.data
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
      const res = await updateTrendingProducts(payload)
      return res.data
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
