import { apiRequest } from "../_shared/request"
export const getSubCategories = async (query) => apiRequest("/subcategories", { query })
