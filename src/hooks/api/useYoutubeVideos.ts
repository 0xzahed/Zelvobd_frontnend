import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError, fileFromUrl } from "@/lib/api-utils"
import { getYoutubeVideos, createYoutubeVideo, updateYoutubeVideo, deleteYoutubeVideo } from "@/src/api/youtubeVideoApi"

export const YOUTUBE_VIDEO_KEYS = {
  all: ["youtubeVideos"] as const,
}

export type YoutubeVideoType = {
  id: string
  title: string
  url: string
  imageUrl: string
  imagePath: string
  createdAt: string
  updatedAt: string
}

export type CreateYoutubeVideoPayload = {
  title: string
  url: string
  image: string
}

export type UpdateYoutubeVideoPayload = Partial<CreateYoutubeVideoPayload> & { id: string }

export function useYoutubeVideos() {
  return useQuery({
    queryKey: YOUTUBE_VIDEO_KEYS.all,
    queryFn: async () => {
      const res = await getYoutubeVideos()
      return (res?.data || []) as YoutubeVideoType[]
    },
  })
}

export function useCreateYoutubeVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateYoutubeVideoPayload) => {
      const formData = new FormData()
      formData.append("title", payload.title)
      formData.append("url", payload.url)
      
      if (payload.image) {
        const file = await fileFromUrl(payload.image, "youtube-thumbnail")
        if (file) formData.append("image", file)
      }
      return createYoutubeVideo(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: YOUTUBE_VIDEO_KEYS.all })
      notify.success({ title: "Success", message: "YouTube video added." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateYoutubeVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateYoutubeVideoPayload) => {
      const formData = new FormData()
      if (payload.title) formData.append("title", payload.title)
      if (payload.url) formData.append("url", payload.url)
      
      if (payload.image && !payload.image.includes("/upload/youtubeVideos")) {
        const file = await fileFromUrl(payload.image, "youtube-thumbnail")
        if (file) formData.append("image", file)
      }
      return updateYoutubeVideo(payload.id, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: YOUTUBE_VIDEO_KEYS.all })
      notify.success({ title: "Updated", message: "YouTube video changes saved." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteYoutubeVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteYoutubeVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: YOUTUBE_VIDEO_KEYS.all })
      notify.success({ title: "Deleted", message: "YouTube video removed." })
    },
    onError: (error) => handleApiError(error),
  })
}
