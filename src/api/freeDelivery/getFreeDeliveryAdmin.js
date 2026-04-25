import { apiRequest } from "../_shared/request"
export const getFreeDeliveryAdmin = async () => apiRequest("/free-delivery/admin")
