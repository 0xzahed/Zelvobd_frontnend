import { apiRequest } from "../_shared/request"
export const getAdmins = async () => apiRequest("/admins")
