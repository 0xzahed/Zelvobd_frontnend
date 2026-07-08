import { adminFetch, BASE_URL, authHeaders } from "@/src/api/mainApi"

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const assertOk = (response: Response, payload: any) => {
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }
}

export type CheckoutPayload = {
  customerName: string
  customerPhone: string
  address: string
  district: string
  union?: string | null
  orderNotes?: string | null
  promoCode?: string | null
  subtotal?: number
  shippingCharge?: number
  discountAmount?: number
  total?: number
  items: Array<{
    productId: string
    quantity: number
    color?: string | null
    size?: string | null
  }>
}

export const placeOrderAPI = async (payload: CheckoutPayload) => {
  const response = await fetch(`${BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || data?.status === false) {
    throw data || { message: "Checkout failed", statusCode: response.status }
  }

  return data.data
}

export type GetOrdersParams = {
  page?: number
  limit?: number
  search?: string
  status?: string | ""
}

export const getOrders = async (params: GetOrdersParams) => {
  const url = new URL(`${BASE_URL}/orders`)
  if (params.page) url.searchParams.append("page", params.page.toString())
  if (params.search) url.searchParams.append("search", params.search)
  if (params.status) url.searchParams.append("status", params.status)

  const response = await adminFetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload.data
}

export const updateOrderStatus = async (id: string, status: string) => {
  const response = await adminFetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload.data
}

export const deleteOrder = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/orders/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
