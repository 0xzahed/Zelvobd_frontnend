import { apiRequest } from "../_shared/request"
export const replaceTopCatalogCategories = async (body) => apiRequest("/top-catalog", { method: "PUT", body })
