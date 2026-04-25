import { apiRequest } from "../_shared/request"
import { tokenStore } from "../_shared/token-store"

export const logout = async (refreshToken) => {
  const token = refreshToken || tokenStore.getRefreshToken()
  const payload = await apiRequest("/auth/admin/logout", {
    method: "POST",
    body: { refreshToken: token },
  })
  tokenStore.clearTokens()
  return payload
}
