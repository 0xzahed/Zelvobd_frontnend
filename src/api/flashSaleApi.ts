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

export const getFlashSaleCampaigns = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/flash-sales", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getFlashSaleCampaignDetails = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getActiveFlashSaleCampaign = async () => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/active`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getActiveFlashSaleProducts = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/flash-sales/active/products", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getAllActiveFlashSaleProducts = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/flash-sales/active/products/all", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const uploadFlashSaleImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("image", file)
  const response = await adminFetch(`${BASE_URL}/uploads/image`, {
    method: "POST",
    body: formData,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload?.data?.url || ""
}

export const createFlashSaleCampaign = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFlashSaleCampaign = async (id: string, body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFlashSaleCampaignTime = async (id: string, body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/${id}/time`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateFlashSaleCampaignProducts = async (id: string, body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/${id}/products`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteFlashSaleCampaign = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/flash-sales/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
