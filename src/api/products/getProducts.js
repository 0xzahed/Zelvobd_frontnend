import { apiRequest } from "../_shared/request"
export const getProducts = async (query) => apiRequest("/products", { query })
