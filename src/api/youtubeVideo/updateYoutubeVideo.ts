import { adminFetch } from "@/src/api/_shared/adminFetch"
import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const updateYoutubeVideo = async (id: string, body: FormData) => {
  const response = await adminFetch(`${BASE_URL}/youtube-videos/${id}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
    },
    body,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
