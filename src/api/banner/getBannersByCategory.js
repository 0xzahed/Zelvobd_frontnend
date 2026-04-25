import { apiRequest } from "../_shared/request"
export const getBannersByCategory = async (categoryId) => apiRequest(`/banners/category/${categoryId}`)
