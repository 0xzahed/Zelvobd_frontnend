import { BASE_URL } from "@/src/api/_shared/client"

export const refreshToken = async (customRefreshToken?: string) => {
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

  const payload = await response.json()

  if (!response.ok || !payload?.status) {
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
