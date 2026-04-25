import { apiRequest } from "../_shared/request"
export const getActiveFlashSaleCampaign = async () => apiRequest("/flash-sales/active")
