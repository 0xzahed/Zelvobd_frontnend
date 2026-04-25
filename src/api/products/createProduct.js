import { apiRequest } from "../_shared/request"
export const createProduct = async (formData) => apiRequest("/products", { method: "POST", body: formData })
