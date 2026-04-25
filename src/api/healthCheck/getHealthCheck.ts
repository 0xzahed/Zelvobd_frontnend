import { BASE_URL } from "@/src/api/_shared/client"

export const getHealthCheck = async () => {
  const response = await fetch(`${BASE_URL}/health`, {
    method: "GET",
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
