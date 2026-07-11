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

export const getBanners = async () => {
  const response = await adminFetch(`${BASE_URL}/banners`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getHomePageBanners = async () => {
  const response = await adminFetch(`${BASE_URL}/banners/home-page`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getBannersByCategory = async (categoryId: string) => {
  const response = await adminFetch(`${BASE_URL}/banners/category/${categoryId}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const getBannerDetails = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/banners/${id}`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const createBanner = async (formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/banners`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateBanner = async (id: string, formData: FormData) => {
  const response = await adminFetch(`${BASE_URL}/banners/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: formData,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteBanner = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/banners/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
