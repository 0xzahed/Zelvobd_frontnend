import { adminFetch, BASE_URL } from "@/src/api/mainApi"

export const getFooterPublic = async () => {
  const response = await fetch(`${BASE_URL}/footer`)
  const payload = await response.json()
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Failed to fetch footer data" }
  }
  return payload.data
}

export const getFooterAdmin = async () => {
  const response = await adminFetch(`${BASE_URL}/footer`, { method: "GET" })
  const payload = await response.json()
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Failed to fetch footer data" }
  }
  return payload.data
}

export const updateFooter = async (data: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/footer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const payload = await response.json()
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Failed to update footer data" }
  }
  return payload.data
}

export const uploadFooterImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("image", file)
  const response = await adminFetch(`${BASE_URL}/uploads/image`, {
    method: "POST",
    body: formData,
  })
  const payload = await response.json()
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Failed to upload image" }
  }
  return payload.data.url
}
