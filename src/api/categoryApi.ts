import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

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

export const getCategories = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/categories", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getCategoryDetails = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/categories/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const createCategory = async (formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateCategory = async (id: string, formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteCategory = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getSubCategories = async (query?: Record<string, unknown>) => {
  const response = await adminFetch(buildQueryUrl("/subcategories", query).toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getSubCategoryDetails = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/subcategories/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const createSubCategory = async (formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/subcategories`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateSubCategory = async (id: string, formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/subcategories/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteSubCategory = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/subcategories/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })

  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
