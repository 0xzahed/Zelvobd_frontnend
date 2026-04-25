import { apiRequest } from "../_shared/request"
export const deleteYoutubeVideo = async (id) => apiRequest(`/youtube-videos/${id}`, { method: "DELETE" })
