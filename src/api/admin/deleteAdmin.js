import { apiRequest } from "../_shared/request"
export const deleteAdmin = async (id) => apiRequest(`/admins/${id}`, { method: "DELETE" })
