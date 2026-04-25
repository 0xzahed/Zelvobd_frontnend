import { apiRequest } from "../_shared/request"
export const updateYoutubeVideo = async (id, body) => apiRequest(`/youtube-videos/${id}`, { method: "PATCH", body })
