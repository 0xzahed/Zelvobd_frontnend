import { apiRequest } from "../_shared/request"
export const deleteCategory = async (id) => apiRequest(`/categories/${id}`, { method: "DELETE" })
