import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const createYoutubeVideo = async (body: Record<string, unknown>) => {
  const response = await fetch(`${BASE_URL}/youtube-videos`, {
    method: "POST",
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
