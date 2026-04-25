import { apiRequest } from "../_shared/request"
export const updateFreeDeliveryCategories = async (body) => apiRequest("/free-delivery/categories", { method: "PATCH", body })
