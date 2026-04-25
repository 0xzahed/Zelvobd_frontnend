import { apiRequest } from "../_shared/request"
export const copyProduct = async (id) => apiRequest(`/products/${id}/copy`, { method: "POST" })
