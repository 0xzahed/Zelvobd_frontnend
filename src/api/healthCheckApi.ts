import { adminFetch, BASE_URL } from "@/src/api/mainApi"

export const getHealthCheck = async () => {
  const response = await adminFetch(`${BASE_URL}/health`, {
    method: "GET",
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
