import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BASE_URL, toAbsoluteUploadUrl } from "@/src/api/mainApi"
import {
  getFlashSaleCampaigns,
  getFlashSaleCampaignDetails,
  createFlashSaleCampaign,
  uploadFlashSaleImage,
  updateFlashSaleCampaign,
  updateFlashSaleCampaignTime,
  updateFlashSaleCampaignProducts,
  deleteFlashSaleCampaign,
} from "@/src/api/flashSaleApi"
import { notify } from "@/lib/notify"
import { fileFromUrl } from "@/lib/api-utils"

export type FlashSaleCampaignSummary = {
  id: string
  title: string
  startAt: string
  endAt: string
  discountType: "PERCENT" | "TAKA"
  discountValue: number
  status: "SCHEDULED" | "ACTIVE" | "EXPIRED"
  productCount: number
  bannerUrl?: string
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

export function useActiveFlashSalesForHome() {
  return useQuery({
    queryKey: ["flash-sales", "active", "home"],
    queryFn: async (): Promise<FlashSaleCampaignSummary[]> => {
      try {
        const response = await fetch(`${BASE_URL}/flash-sales/active`, { method: "GET" })
        if (!response.ok) return []
        const payload = await response.json()
        const raw = payload?.data?.campaigns
        const campaigns = Array.isArray(raw) ? raw : []
        return campaigns.map((c: any) => ({
          ...c,
          bannerUrl: c.bannerUrl ? toAbsoluteUploadUrl(c.bannerUrl) : undefined,
        }))
      } catch (err) {
        console.error("[FlashSale] error:", err)
        return []
      }
    },
  })
}

export function useFlashSales(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["flash-sales", page, limit],
    queryFn: async (): Promise<PaginatedFlashSaleCampaigns> => {
      const res = await getFlashSaleCampaigns({ page, limit })
      return res.data
    },
  })
}

export function useFlashSaleDetails(id: string) {
  return useQuery({
    queryKey: ["flash-sales", id],
    queryFn: async (): Promise<FlashSaleCampaignDetails> => {
      const res = await getFlashSaleCampaignDetails(id)
      const data = res.data as FlashSaleCampaignDetails
      if (data.bannerUrl) {
        data.bannerUrl = toAbsoluteUploadUrl(data.bannerUrl)
      }
      return data
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
      bannerUrl?: string
    }) => {
      let { bannerUrl, ...rest } = payload
      if (bannerUrl?.startsWith("data:")) {
        const file = await fileFromUrl(bannerUrl, "banner")
        if (file) {
          try {
            const uploaded = await uploadFlashSaleImage(file)
            if (uploaded) bannerUrl = uploaded
            else {
              console.warn("[FlashSale] image upload returned empty URL")
              bannerUrl = undefined
            }
          } catch (e) {
            console.error("[FlashSale] image upload failed:", e)
            bannerUrl = undefined
          }
        } else {
          console.warn("[FlashSale] fileFromUrl returned null")
          bannerUrl = undefined
        }
      }
      const res = await createFlashSaleCampaign(bannerUrl ? { ...rest, bannerUrl } : rest)
      return res.data
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
      const res = await updateFlashSaleCampaignTime(id, payload)
      return res.data
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
      const res = await updateFlashSaleCampaignProducts(id, payload)
      return res.data
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

export function useUpdateFlashSaleCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const data = { ...payload }
      const bannerUrl = data.bannerUrl as string | undefined
      if (bannerUrl?.startsWith("data:")) {
        const file = await fileFromUrl(bannerUrl, "banner")
        if (file) {
          try {
            const url = await uploadFlashSaleImage(file)
            if (url) data.bannerUrl = url
            else delete data.bannerUrl
          } catch {
            delete data.bannerUrl
          }
        } else {
          delete data.bannerUrl
        }
      }
      const res = await updateFlashSaleCampaign(id, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sales"] })
      notify.success("Flash sale updated successfully")
    },
    onError: (err: any) => {
      notify.error(err.message || "Failed to update flash sale")
    },
  })
}

export function useDeleteFlashSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteFlashSaleCampaign(id)
      return res.data
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
