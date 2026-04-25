import { apiRequest } from "../_shared/request"
export const getActiveFlashSaleProducts = async (query) => apiRequest("/flash-sales/active/products", { query })
