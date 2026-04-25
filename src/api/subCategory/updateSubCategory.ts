import { BASE_URL, authHeaders } from "@/src/api/_shared/client"

export const updateSubCategory = async (id: string, formData: FormData) => {
  const response = await fetch(`${BASE_URL}/subcategories/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders() },
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
