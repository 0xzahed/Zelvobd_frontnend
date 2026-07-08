import { adminFetch, BASE_URL, authHeaders, mapProduct } from "@/src/api/mainApi"
import type { Product } from "@/lib/types"

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
      if (key === "limit") {
        const numeric = Number(value)
        const safeLimit = Number.isFinite(numeric) ? Math.min(Math.max(Math.floor(numeric), 1), 100) : 100
        url.searchParams.set(key, String(safeLimit))
        return
      }
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

export const getProducts = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/products", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getProductDetails = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/products/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getStorefrontProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${BASE_URL}/products/slug/${slug}`, {
      method: "GET",
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    })
    const payload = await response.json()
    if (!response.ok || payload?.status === false) return null
    return mapProduct(payload.data)
  } catch (error) {
    console.error("Failed to fetch product by slug:", error)
    return null
  }
}

export const createProduct = async (formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateProduct = async (id: string, formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/products/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: formData,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const copyProduct = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/products/${id}/copy`, {
    method: "POST",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteProduct = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
