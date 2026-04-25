import { apiRequest } from "../_shared/request"
export const deleteFlashSaleCampaign = async (id) => apiRequest(`/flash-sales/${id}`, { method: "DELETE" })
