import { apiRequest } from "../_shared/request"
export const deleteBanner = async (id) => apiRequest(`/banners/${id}`, { method: "DELETE" })
