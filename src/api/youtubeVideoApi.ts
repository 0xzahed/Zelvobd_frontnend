import { adminFetch, BASE_URL, authHeaders } from "@/src/api/mainApi"

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const assertOk = (response: Response, payload: any) => {
  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }
}

export const getYoutubeVideos = async () => {
  const response = await adminFetch(`${BASE_URL}/youtube-videos`, {
    method: "GET",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const createYoutubeVideo = async (body: FormData) => {
  const response = await adminFetch(`${BASE_URL}/youtube-videos`, {
    method: "POST",
    headers: { ...authHeaders() },
    body,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const updateYoutubeVideo = async (id: string, body: FormData) => {
  const response = await adminFetch(`${BASE_URL}/youtube-videos/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body,
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}

export const deleteYoutubeVideo = async (id: string) => {
  const response = await adminFetch(`${BASE_URL}/youtube-videos/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  })
  const payload = await parseJsonSafe(response)
  assertOk(response, payload)
  return payload
}
