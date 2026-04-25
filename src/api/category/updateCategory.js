import { apiRequest } from "../_shared/request"
export const updateCategory = async (id, formData) => apiRequest(`/categories/${id}`, { method: "PATCH", body: formData })
