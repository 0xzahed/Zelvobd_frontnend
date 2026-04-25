import { apiRequest } from "../_shared/request"
export const createYoutubeVideo = async (body) => apiRequest("/youtube-videos", { method: "POST", body })
