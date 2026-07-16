import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFreeDelivery, getFreeDeliveryAdmin, updateFreeDeliveryCampaign, updateFreeDeliveryProducts } from "@/src/api/freeDeliveryApi"
import { mapProduct } from "@/src/api/mainApi"
import { notify } from "@/lib/notify"
import type { Product } from "@/lib/types"

export type FreeDeliveryAdminResponse = {
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
  freeProductCount: number
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
      product: { id: string; title: string; slug: string; isFreeDelivery: boolean; category: { id: string; title: string } | null; subCategory: { id: string; title: string } | null }
    }>
    excludedProducts: Array<{
      id: string
      productId: string
      product: { id: string; title: string; slug: string; category: { id: string; title: string } | null; subCategory: { id: string; title: string } | null }
    }>
  }
}

export function useFreeDeliveryAdmin() {
  return useQuery({
    queryKey: ["free-delivery-admin"],
    queryFn: async (): Promise<FreeDeliveryAdminResponse> => {
      const res = await getFreeDeliveryAdmin()
      return res.data
    },
  })
}

export function useUpdateFreeDeliveryCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { title?: string; isActive?: boolean }) => {
      return updateFreeDeliveryCampaign(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-delivery-admin"] })
      notify.success("Free Delivery campaign updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update campaign")
    },
  })
}

export function useUpdateFreeDeliveryProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { addProductIds?: string[]; removeProductIds?: string[] }) => {
      return updateFreeDeliveryProducts(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["free-delivery-admin"] })
      notify.success("Free Delivery products updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update products")
    },
  })
}

export const FREE_DELIVERY_KEYS = {
  storefront: ["free-delivery-storefront"] as const,
}

export function useStorefrontFreeDelivery() {
  return useQuery({
    queryKey: FREE_DELIVERY_KEYS.storefront,
    queryFn: async () => {
      const res = await getFreeDelivery({ limit: 9 })
      return (res?.data?.products || [])
        .map((product: any) => ({
          ...mapProduct(product),
          isFreeDelivery: true,
        }))
        .filter((p: Product) => p.availability !== false)
    },
  })
}
