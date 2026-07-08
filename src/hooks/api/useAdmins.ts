"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError } from "@/lib/api-utils"
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/src/api/adminApi"
import type { Admin } from "@/lib/types"

export const ADMIN_KEYS = {
  all: ["admins"] as const,
}

export function useAdmins() {
  return useQuery({
    queryKey: ADMIN_KEYS.all,
    queryFn: async () => {
      const res = await getAdmins()
      return (res?.data || []) as Admin[]
    },
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { email: string; password: string }) => createAdmin(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
      notify.success({ title: "Admin Created", message: "New admin user has been added." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; email?: string; password?: string; isActive?: boolean }) =>
      updateAdmin(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
      notify.success({ title: "Admin Updated", message: "Admin user has been updated." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.all })
      notify.success({ title: "Admin Deleted", message: "Admin user removed." })
    },
    onError: (error) => handleApiError(error),
  })
}
