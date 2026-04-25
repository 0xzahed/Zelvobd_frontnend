import { apiRequest } from "../_shared/request"
export const getHomePageBanners = async () => apiRequest("/banners/home-page")
