export const copyProduct = async (id) => {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api/v1"

  const accessToken =
    typeof window === "undefined" ? null : localStorage.getItem("admin_access_token")

  const response = await fetch(`${BASE_URL}/products/${id}/copy`, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
