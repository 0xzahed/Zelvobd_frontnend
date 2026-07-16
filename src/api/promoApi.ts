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

export const applyPromoAPI = async (code: string, orderValue: number) => {
  const response = await fetch(`${BASE_URL}/promos/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, orderValue }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload.data
}

export const getPromos = async () => {
  const response = await adminFetch(`${BASE_URL}/promos`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const createPromo = async (data: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/promos`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updatePromo = async (id: string, data: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/promos/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deletePromo = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/promos/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
