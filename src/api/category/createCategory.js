import { apiRequest } from "../_shared/request"
export const createCategory = async (formData) => apiRequest("/categories", { method: "POST", body: formData })
