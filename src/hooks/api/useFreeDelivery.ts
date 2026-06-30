import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"
import { notify } from "@/lib/notify"

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
      const res = await adminFetch(`${BASE_URL}/free-delivery/admin`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch free delivery config")
      return data.data
    },
  })
}

export function useUpdateFreeDeliveryCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { title?: string; isActive?: boolean }) => {
      const res = await adminFetch(`${BASE_URL}/free-delivery/campaign`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update campaign")
      return data.data
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
      const res = await adminFetch(`${BASE_URL}/free-delivery/products`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update products")
      return data.data
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

import { getFreeDelivery } from "@/src/api/freeDelivery/getFreeDelivery"
import { mapProduct } from "@/src/api/_shared/mappers"

export const FREE_DELIVERY_KEYS = {
  storefront: ["free-delivery-storefront"] as const,
}

export function useStorefrontFreeDelivery() {
  return useQuery({
    queryKey: FREE_DELIVERY_KEYS.storefront,
    queryFn: async () => {
      const res = await getFreeDelivery({ limit: 9 })
      return (res?.data?.products || []).map((product: any) => ({
        ...mapProduct(product),
        isFreeDelivery: true,
      }))
    },
  })
}
