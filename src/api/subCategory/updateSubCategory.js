import { apiRequest } from "../_shared/request"
export const updateSubCategory = async (id, formData) => apiRequest(`/subcategories/${id}`, { method: "PATCH", body: formData })
