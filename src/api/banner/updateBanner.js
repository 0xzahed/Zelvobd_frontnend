import { apiRequest } from "../_shared/request"
export const updateBanner = async (id, formData) => apiRequest(`/banners/${id}`, { method: "PATCH", body: formData })
