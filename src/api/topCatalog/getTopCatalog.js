import { apiRequest } from "../_shared/request"
export const getTopCatalog = async (query) => apiRequest("/top-catalog", { query })
