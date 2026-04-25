import { apiRequest } from "../_shared/request"

export const getHealthCheck = async () => {
  return apiRequest("/health")
}
