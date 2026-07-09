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

export type Customer = {
  phone: string
  name: string
  address: string
  district: string
  orderCount: number
  deliveredCount: number
  totalSpent: number
  lastOrderAt: string
}

export type CustomerStats = {
  totalCustomers: number
  totalOrders: number
  deliveredOrders: number
  totalRevenue: number
  avgOrderValue: number
}

export type GetCustomersParams = {
  page?: number
  limit?: number
  search?: string
}

export const getCustomers = async (params: GetCustomersParams) => {
  const url = new URL(`${BASE_URL}/customers`)
  if (params.page) url.searchParams.append("page", params.page.toString())
  if (params.limit) url.searchParams.append("limit", params.limit.toString())
  if (params.search) url.searchParams.append("search", params.search)

  const response = await adminFetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload.data
}

export const getCustomerStats = async () => {
  const response = await adminFetch(`${BASE_URL}/customers/stats`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload.data
}
