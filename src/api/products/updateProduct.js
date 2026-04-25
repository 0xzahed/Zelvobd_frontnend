import { apiRequest } from "../_shared/request"
export const updateProduct = async (id, formData) => apiRequest(`/products/${id}`, { method: "PATCH", body: formData })
