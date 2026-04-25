import { apiRequest } from "../_shared/request"
export const getAllActiveFlashSaleProducts = async (query) => apiRequest("/flash-sales/active/products/all", { query })
