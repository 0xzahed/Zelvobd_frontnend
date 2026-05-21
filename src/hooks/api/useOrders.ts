import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"
import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

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

const getOrders = async (params: GetOrdersParams) => {
  const url = new URL(`${BASE_URL}/orders`)
  if (params.page) url.searchParams.append("page", params.page.toString())
  if (params.limit) url.searchParams.append("limit", params.limit.toString())
  if (params.search) url.searchParams.append("search", params.search)
  if (params.status) url.searchParams.append("status", params.status)

  const response = await adminFetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload.data as {
    meta: { page: number; limit: number; total: number; totalPage: number }
    orders: Order[]
  }
}

const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const response = await adminFetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload.data as Order
}

const deleteOrder = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/orders/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
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
