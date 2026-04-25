import { apiRequest } from "../_shared/request"
export const getCategories = async (query) => apiRequest("/categories", { query })
