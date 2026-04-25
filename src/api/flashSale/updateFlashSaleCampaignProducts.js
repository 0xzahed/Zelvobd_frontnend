import { apiRequest } from "../_shared/request"
export const updateFlashSaleCampaignProducts = async (id, body) => apiRequest(`/flash-sales/${id}/products`, { method: "PATCH", body })
