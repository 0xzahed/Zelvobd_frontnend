import { apiRequest } from "../_shared/request"
export const getCategoryDetails = async (id) => apiRequest(`/categories/${id}`)
