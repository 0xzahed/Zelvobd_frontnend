import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const getFreeDeliveryAdmin = async () => {
  const response = await fetch(`${BASE_URL}/free-delivery/admin`, {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
