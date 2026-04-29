import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const getTopCatalog = async (query?: Record<string, unknown>) => {
  const url = new URL(`${BASE_URL}/top-catalog`)
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await adminFetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
