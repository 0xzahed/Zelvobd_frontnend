import { apiRequest } from "../_shared/request"
export const getBanners = async () => apiRequest("/banners")
