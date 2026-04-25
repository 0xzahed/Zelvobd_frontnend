import { apiRequest } from "../_shared/request"
export const createBanner = async (formData) => apiRequest("/banners", { method: "POST", body: formData })
