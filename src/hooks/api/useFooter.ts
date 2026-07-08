"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"
import { getFooterAdmin, updateFooter } from "@/src/api/footerApi"

export const FOOTER_KEYS = {
  all: ["footer"] as const,
}

export function useFooter() {
  return useQuery({
    queryKey: FOOTER_KEYS.all,
    queryFn: async () => {
      const res = await getFooterAdmin()
      return res as Record<string, any>
    },
  })
}

export function useUpdateFooter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateFooter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOOTER_KEYS.all })
      notify.success({ title: "Footer Updated", message: "Footer content has been saved." })
    },
    onError: (error) => handleApiError(error),
  })
}
