import { apiRequest } from "../_shared/request"
import { tokenStore } from "../_shared/token-store"

export const login = async (body) => {
  const payload = await apiRequest("/auth/admin/login", { method: "POST", body })
  tokenStore.setTokens({
    accessToken: payload?.data?.accessToken,
    refreshToken: payload?.data?.refreshToken,
  })
  return payload
}
