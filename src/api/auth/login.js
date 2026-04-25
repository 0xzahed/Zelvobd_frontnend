export const login = async (body) => {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"

  const response = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body || {}),
  })

  const payload = await response.json().catch(() => null)

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
