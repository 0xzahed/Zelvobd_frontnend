import { apiRequest } from "../_shared/request"
export const updateFlashSaleCampaignTime = async (id, body) => apiRequest(`/flash-sales/${id}/time`, { method: "PATCH", body })
