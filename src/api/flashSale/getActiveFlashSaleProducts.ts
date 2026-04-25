import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const getActiveFlashSaleProducts = async (query?: Record<string, unknown>) => {
  const url = new URL(`${BASE_URL}/flash-sales/active/products`)
  if (query && typeof query === "object") {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { ...authHeaders() },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
