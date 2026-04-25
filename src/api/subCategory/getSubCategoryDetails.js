import { apiRequest } from "../_shared/request"
export const getSubCategoryDetails = async (id) => apiRequest(`/subcategories/${id}`)
