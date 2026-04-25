import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const logout = async (refreshToken?: string) => {
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
