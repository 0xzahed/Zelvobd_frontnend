import { apiRequest } from "../_shared/request"
export const getBannerDetails = async (id) => apiRequest(`/banners/${id}`)
