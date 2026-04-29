import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const updateFreeDeliveryProducts = async (body: Record<string, unknown>) => {
  const response = await adminFetch(`${BASE_URL}/free-delivery/products`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body || {}),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
