import { BASE_URL } from "@/src/api/_shared/client"

export const applyPromoAPI = async (code: string, orderValue: number) => {
  const response = await fetch(`${BASE_URL}/promos/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, orderValue }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload.data
}
