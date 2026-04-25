import { apiRequest } from "../_shared/request"
export const createSubCategory = async (formData) => apiRequest("/subcategories", { method: "POST", body: formData })
