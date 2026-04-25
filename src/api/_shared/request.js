import { BASE_URL } from "./baseUrl"
import { tokenStore } from "./token-store"
import { refreshToken } from "../auth/refreshToken"

const buildUrl = (path, query) => {
  const url = new URL(`${BASE_URL}${path}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

export const apiRequest = async (path, options = {}) => {
  const { method = "GET", body, query, headers = {}, isRetry = false } = options
  const accessToken = tokenStore.getAccessToken()

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    const message = payload?.message || "Request failed"
    const isExpired =
      response.status === 401 &&
      String(message).toLowerCase().includes("token") &&
      String(message).toLowerCase().includes("expired")

    if (!isRetry && isExpired && tokenStore.getRefreshToken()) {
      await refreshToken()
      return apiRequest(path, { ...options, isRetry: true })
    }

    throw payload || { message, statusCode: response.status }
  }

  return payload
}
