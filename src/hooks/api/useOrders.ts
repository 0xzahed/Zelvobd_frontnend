import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"
import { getOrders, getOrderById, updateOrderStatus, updateOrder, deleteOrder } from "@/src/api/orderApi"

export const ORDER_KEYS = {
  all: ["orders"] as const,
  list: (params: any) => ["orders", "list", params] as const,
  details: (id: string) => ["orders", "details", id] as const,
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "HOLD"
  | "PICKUP"
  | "DELIVERED"
  | "CUSTOMER_CANCELLED"
  | "CANCELLED"
  | "TRASH"

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string | null
  price: number
  quantity: number
  color: string | null
  size: string | null
}

export type Order = {
  id: string
  code: string
  customerName: string
  customerPhone: string
  address: string
  district: string
  union: string | null
  orderNotes: string | null
  subtotal: number
  shippingCharge: number
  discountAmount: number
  total: number
  promoCode: string | null
  consignmentId: string | null
  trackingCode: string | null
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type GetOrdersParams = {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus | ""
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: ORDER_KEYS.details(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
  })
}

export function useOrders(params: GetOrdersParams) {
  return useQuery({
    queryKey: ORDER_KEYS.list(params),
    queryFn: () => getOrders(params),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
      notify.success({ title: "Status Updated", message: `Order ${data.code} marked as ${data.status}.` })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import("@/src/api/orderApi").UpdateOrderPayload }) => updateOrder(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.details(data.id) })
      notify.success({ title: "Order Updated", message: `Order ${data.code} has been updated.` })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all })
      notify.success({ title: "Deleted", message: "Order removed." })
    },
    onError: (error) => handleApiError(error),
  })
}
