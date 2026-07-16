import { BASE_URL } from "@/src/api/mainApi"

export const getCategoryBannersPublic = async (categoryId: string) => {
  const response = await fetch(`${BASE_URL}/category-banners?categoryId=${categoryId}`)

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.status === false) {
    throw payload || { message: "Request failed", statusCode: response.status }
  }

  return payload
}
