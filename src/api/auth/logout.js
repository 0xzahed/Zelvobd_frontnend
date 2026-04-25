export const logout = async (refreshToken) => {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"

  const token =
    refreshToken ||
    (typeof window === "undefined" ? null : localStorage.getItem("admin_refresh_token"))
  const accessToken =
    typeof window === "undefined" ? null : localStorage.getItem("admin_access_token")

  const response = await fetch(`${BASE_URL}/auth/admin/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ refreshToken: token }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_access_token")
    localStorage.removeItem("admin_refresh_token")
  }

  return payload
}
