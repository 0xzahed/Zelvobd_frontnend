import { apiRequest } from "../_shared/request"
export const updateFreeDeliverySubCategories = async (body) => apiRequest("/free-delivery/sub-categories", { method: "PATCH", body })
