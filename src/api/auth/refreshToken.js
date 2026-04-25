import { BASE_URL } from "../_shared/baseUrl"
import { tokenStore } from "../_shared/token-store"

export const refreshToken = async (customRefreshToken) => {
  const refreshTokenValue = customRefreshToken || tokenStore.getRefreshToken()
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

  tokenStore.setTokens(tokens)
  return payload
}
