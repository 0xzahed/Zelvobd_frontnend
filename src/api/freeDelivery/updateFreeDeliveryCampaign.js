import { apiRequest } from "../_shared/request"
export const updateFreeDeliveryCampaign = async (body) => apiRequest("/free-delivery/campaign", { method: "PATCH", body })
