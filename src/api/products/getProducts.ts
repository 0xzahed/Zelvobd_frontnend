import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const getProducts = async (query?: Record<string, unknown>) => {
  const url = new URL(`${BASE_URL}/products`)
  if (query && typeof query === "object") {
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
