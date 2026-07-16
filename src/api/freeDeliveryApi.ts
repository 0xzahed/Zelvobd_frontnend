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

const buildQueryUrl = (path: string, query?: Record<string, unknown>) => {
  const url = new URL(`${BASE_URL}${path}`)
  if (!query || typeof query !== "object") return url
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

export const getFreeDelivery = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/free-delivery", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getFreeDeliveryAdmin = async () => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/admin`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFreeDeliveryCampaign = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/campaign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFreeDeliveryCategories = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/categories`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFreeDeliverySubCategories = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/sub-categories`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFreeDeliveryProducts = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/products`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
