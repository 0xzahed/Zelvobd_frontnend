import { apiRequest } from "../_shared/request"
export const getFlashSaleCampaignDetails = async (id) => apiRequest(`/flash-sales/${id}`)
