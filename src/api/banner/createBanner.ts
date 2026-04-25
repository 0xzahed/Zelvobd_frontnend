import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const createBanner = async (formData: FormData) => {
  const response = await fetch(`${BASE_URL}/banners`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
