import { apiRequest } from "../_shared/request"
export const getYoutubeVideos = async () => apiRequest("/youtube-videos")
