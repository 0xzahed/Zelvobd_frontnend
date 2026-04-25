import { apiRequest } from "../_shared/request"
export const createAdmin = async (body) => apiRequest("/admins", { method: "POST", body })
