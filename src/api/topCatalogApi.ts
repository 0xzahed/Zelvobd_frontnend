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

export const getTopCatalog = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/top-catalog", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const replaceTopCatalogCategories = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/top-catalog`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body || {}),
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
