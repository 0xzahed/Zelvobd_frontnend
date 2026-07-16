import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError, fileFromUrl } from "@/lib/api-utils"
import { getBanners, getHomePageBanners, createBanner, updateBanner, deleteBanner } from "@/src/api/bannerApi"
import { mapBanner } from "@/src/api/mainApi"

export const BANNER_KEYS = {
  all: ["banners"] as const,
}

// We will use a modified Slider type internally here to ensure categoryId is passed
export type CreateBannerPayload = {
  title: string
  subtitle?: string
  url: string
  categoryId: string
  image: string
  inHomePage?: boolean
}

export type UpdateBannerPayload = Partial<CreateBannerPayload> & { id: string }

export function useBanners() {
  return useQuery({
    queryKey: BANNER_KEYS.all,
    queryFn: async () => {
      const res = await getBanners()
      // Note: mapBanner returns a Slider type. 
      // The backend returns categoryId in banner.categoryId, but mapBanner currently drops it?
      // Let's rely on what we have, or we can fetch it raw if needed.
      return (res?.data || []).map((b: any) => ({
        ...mapBanner(b),
        categoryId: b.categoryId, // Injecting categoryId for frontend use
        inHomePage: b.inHomePage, // Injecting inHomePage for frontend use
      }))
    },
  })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBannerPayload) => {
      const formData = new FormData()
      formData.append("title", payload.title)
      if (payload.subtitle !== undefined) formData.append("subTitle", payload.subtitle)
      formData.append("url", payload.url)
      formData.append("categoryId", payload.categoryId)
      formData.append("inHomePage", String(payload.inHomePage ?? true))
      
      if (payload.image) {
        const file = await fileFromUrl(payload.image, "banner-image")
        if (file) formData.append("image", file)
      }
      return createBanner(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all })
      notify.success({ title: "Success", message: "Banner added to slider." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateBannerPayload) => {
      const formData = new FormData()
      if (payload.title) formData.append("title", payload.title)
      if (payload.subtitle !== undefined) formData.append("subTitle", payload.subtitle)
      if (payload.url) formData.append("url", payload.url)
      if (payload.categoryId) formData.append("categoryId", payload.categoryId)
      if (payload.inHomePage !== undefined) formData.append("inHomePage", String(payload.inHomePage))
      
      if (payload.image) {
        const file = await fileFromUrl(payload.image, "banner-image")
        if (file) formData.append("image", file)
      }
      return updateBanner(payload.id, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all })
      notify.success({ title: "Updated", message: "Banner changes saved." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANNER_KEYS.all })
      notify.success({ title: "Deleted", message: "Banner removed." })
    },
    onError: (error) => handleApiError(error),
  })
}

export const HOME_BANNER_KEYS = {
  all: ["home-banners"] as const,
}

export function useHomePageBanners() {
  return useQuery({
    queryKey: HOME_BANNER_KEYS.all,
    queryFn: async () => {
      const res = await getHomePageBanners()
      return (res?.data || []).map(mapBanner)
    },
  })
}
