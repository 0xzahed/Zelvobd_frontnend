import { apiRequest } from "../_shared/request"
export const getFlashSaleCampaigns = async (query) => apiRequest("/flash-sales", { query })
