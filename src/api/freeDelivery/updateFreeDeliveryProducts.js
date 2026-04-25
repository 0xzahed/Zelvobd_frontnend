import { apiRequest } from "../_shared/request"
export const updateFreeDeliveryProducts = async (body) => apiRequest("/free-delivery/products", { method: "PATCH", body })
