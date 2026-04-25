const ACCESS_TOKEN_KEY = "admin_access_token"
const REFRESH_TOKEN_KEY = "admin_refresh_token"

export const tokenStore = {
  getAccessToken() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens({ accessToken, refreshToken }) {
    if (typeof window === "undefined") return
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens() {
    if (typeof window === "undefined") return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
