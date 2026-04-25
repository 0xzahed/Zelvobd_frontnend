import { apiRequest } from "../_shared/request"
export const deleteSubCategory = async (id) => apiRequest(`/subcategories/${id}`, { method: "DELETE" })
