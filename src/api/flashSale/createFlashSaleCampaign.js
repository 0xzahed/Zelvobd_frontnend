import { apiRequest } from "../_shared/request"
export const createFlashSaleCampaign = async (body) => apiRequest("/flash-sales", { method: "POST", body })
