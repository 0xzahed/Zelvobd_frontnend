import { apiRequest } from "../_shared/request"
export const getProductDetails = async (id) => apiRequest(`/products/${id}`)
