import { apiRequest } from "../_shared/request"
export const getFreeDelivery = async (query) => apiRequest("/free-delivery", { query })
