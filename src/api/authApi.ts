import { BASE_URL, authHeaders } from "@/src/api/mainApi"

type AuthPayload = Record<string, unknown>

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export const loginAdmin = async (body: AuthPayload) => {
  const response = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  })

  const payload = await parseJsonSafe(response)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  if (typeof window !== "undefined") {
    const accessToken = payload?.data?.accessToken
    const refreshToken = payload?.data?.refreshToken
    if (accessToken) localStorage.setItem("admin_access_token", accessToken)
    if (refreshToken) localStorage.setItem("admin_refresh_token", refreshToken)
  }

  return payload
}

export const refreshAdminToken = async (customRefreshToken?: string) => {
  const refreshTokenValue =
    customRefreshToken ||
    (typeof window === "undefined" ? null : localStorage.getItem("admin_refresh_token"))

  if (!refreshTokenValue) {
    throw new Error("No refresh token available")
  }

  const response = await fetch(`${BASE_URL}/auth/admin/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  })

  const payload = await parseJsonSafe(response)

  if (!response.ok || payload?.status === false) {
    throw new Error(payload?.message || "Failed to refresh admin token")
  }

  const tokens = {
    accessToken: payload?.data?.accessToken,
    refreshToken: payload?.data?.refreshToken,
  }

  if (typeof window !== "undefined") {
    if (tokens.accessToken) localStorage.setItem("admin_access_token", tokens.accessToken)
    if (tokens.refreshToken) localStorage.setItem("admin_refresh_token", tokens.refreshToken)
  }

  return payload
}

export const logoutAdmin = async (refreshToken?: string) => {
  const token =
    refreshToken ||
    (typeof window === "undefined" ? null : localStorage.getItem("admin_refresh_token"))

  const response = await fetch(`${BASE_URL}/auth/admin/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ refreshToken: token }),
  })

  const payload = await parseJsonSafe(response)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_access_token")
    localStorage.removeItem("admin_refresh_token")
  }

  return payload
}
