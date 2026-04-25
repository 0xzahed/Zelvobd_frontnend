import { apiRequest } from "../_shared/request"
export const deleteProduct = async (id) => apiRequest(`/products/${id}`, { method: "DELETE" })
