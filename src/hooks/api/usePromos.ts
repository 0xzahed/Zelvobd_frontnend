import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"
import { getPromos, createPromo, updatePromo, deletePromo } from "@/src/api/promoApi"

export const PROMO_KEYS = {
  all: ["promos"] as const,
}

export type PromoDiscountType = "AMOUNT" | "PERCENT"

export type PromoCode = {
  id: string
  code: string
  discountType: PromoDiscountType
  discountValue: number
  minOrderValue: number | null
  maxDiscount: number | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type CreatePromoPayload = {
  code: string
  discountType: PromoDiscountType
  discountValue: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  startDate?: string | null
  endDate?: string | null
  isActive?: boolean
}

export type UpdatePromoPayload = Partial<CreatePromoPayload> & { id: string }

export function usePromos() {
  return useQuery({
    queryKey: PROMO_KEYS.all,
    queryFn: async () => {
      const res = await getPromos()
      return res?.data?.promos || []
    },
  })
}

export function useCreatePromo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePromoPayload) => createPromo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMO_KEYS.all })
      notify.success({ title: "Success", message: "Promo code created." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdatePromo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePromoPayload) => {
      const { id, ...data } = payload
      return updatePromo(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMO_KEYS.all })
      notify.success({ title: "Updated", message: "Promo code updated." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeletePromo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePromo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMO_KEYS.all })
      notify.success({ title: "Deleted", message: "Promo code removed." })
    },
    onError: (error) => handleApiError(error),
  })
}
