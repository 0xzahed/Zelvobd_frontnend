import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"
import { notify } from "@/lib/notify"

export type FlashSaleCampaignSummary = {
  id: string
  title: string
  startAt: string
  endAt: string
  discountType: "PERCENT" | "TAKA"
  discountValue: number
  status: "SCHEDULED" | "ACTIVE" | "EXPIRED"
  productCount: number
  createdAt: string
  updatedAt: string
}

export type FlashSaleProduct = {
  id: string
  productId: string
  createdAt: string
  product: {
    id: string
    title: string
    slug: string
    stock: boolean
    availability: boolean
    isFreeDelivery: boolean
  }
}

export type FlashSaleCampaignDetails = FlashSaleCampaignSummary & {
  products: FlashSaleProduct[]
}

export type PaginatedFlashSaleCampaigns = {
  meta: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
  campaigns: FlashSaleCampaignSummary[]
}

export function useFlashSales(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["flash-sales", page, limit],
    queryFn: async (): Promise<PaginatedFlashSaleCampaigns> => {
      const res = await adminFetch(`${BASE_URL}/flash-sales?page=${page}&limit=${limit}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch flash sales")
      return data.data
    },
  })
}

export function useFlashSaleDetails(id: string) {
  return useQuery({
    queryKey: ["flash-sales", id],
    queryFn: async (): Promise<FlashSaleCampaignDetails> => {
      const res = await adminFetch(`${BASE_URL}/flash-sales/${id}`, {
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch flash sale details")
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateFlashSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      title: string
      startAt: string
      endAt: string
      discountType: "PERCENT" | "TAKA"
      discountValue: number
      productIds: string[]
    }) => {
      const res = await adminFetch(`${BASE_URL}/flash-sales`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to create flash sale")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] })
      notify.success("Flash sale created successfully")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to create flash sale")
    },
  })
}

export function useUpdateFlashSaleTime() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { startAt?: string; endAt?: string } }) => {
      const res = await adminFetch(`${BASE_URL}/flash-sales/${id}/time`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update time")
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] })
      queryClient.invalidateQueries({ queryKey: ["flash-sales", variables.id] })
      notify.success("Flash sale time updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update time")
    },
  })
}

export function useUpdateFlashSaleProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { addProductIds?: string[]; removeProductIds?: string[] } }) => {
      const res = await adminFetch(`${BASE_URL}/flash-sales/${id}/products`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update products")
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] })
      queryClient.invalidateQueries({ queryKey: ["flash-sales", variables.id] })
      notify.success("Flash sale products updated")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update products")
    },
  })
}

export function useDeleteFlashSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`${BASE_URL}/flash-sales/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to delete flash sale")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] })
      notify.success("Flash sale deleted successfully")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to delete flash sale")
    },
  })
}
