import { apiRequest } from "../_shared/request"
export const updateAdmin = async (id, body) => apiRequest(`/admins/${id}`, { method: "PATCH", body })
