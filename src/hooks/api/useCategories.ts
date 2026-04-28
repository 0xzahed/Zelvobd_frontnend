import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notify } from "@/lib/notify"
import { handleApiError, fileFromUrl } from "@/lib/api-utils"
import {
  getCategories,
  getCategoryDetails,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/src/api/categoryApi"
import { mapCategory, mapSubCategory } from "@/src/api/_shared/mappers"
import type { Category, SubCategory } from "@/lib/types"

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  details: (id: string) => ["categories", id] as const,
  subCategories: (categoryId: string) => ["categories", categoryId, "subCategories"] as const,
}

// -- Queries --

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: async () => {
      const res = await getCategories({ limit: 100 })
      const categoryList: Category[] = (res?.data?.categories || []).map(mapCategory)
      return categoryList
    },
  })
}

export function useCategoryDetails(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CATEGORY_KEYS.details(id),
    queryFn: async () => {
      const res = await getCategoryDetails(id)
      return res?.data
    },
    ...options,
  })
}

export function useSubCategories(categoryId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CATEGORY_KEYS.subCategories(categoryId),
    queryFn: async () => {
      const res = await getSubCategories({ limit: 100, categoryId })
      const subCategoryList: any[] = (res?.data?.subCategories || []).map(mapSubCategory)
      
      return subCategoryList.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        image: sub.image,
        parentId: sub.categoryId || categoryId,
        parentName: sub.categoryName || "",
      }))
    },
    ...options,
  })
}

// -- Mutations --

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (c: Category) => {
      const formData = new FormData()
      formData.append("title", c.name)
      if (c.image) {
        const file = await fileFromUrl(c.image, "category-image")
        if (file) formData.append("image", file)
      }
      return createCategory(formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      notify.success({ title: "Success", message: `Category "${variables.name}" added.` })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const formData = new FormData()
      if (data.name) formData.append("title", data.name)
      if (data.image) {
        const file = await fileFromUrl(data.image, "category-image")
        if (file) formData.append("image", file)
      }
      return updateCategory(id, formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.details(variables.id) })
      notify.success({ title: "Updated", message: "Category changes saved." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      notify.success({ title: "Deleted", message: "Category removed." })
    },
    onError: (error) => handleApiError(error),
  })
}

// SubCategory Mutations

export function useCreateSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, sub }: { categoryId: string; sub: SubCategory }) => {
      const formData = new FormData()
      formData.append("categoryId", categoryId)
      formData.append("title", sub.name)
      if (sub.image) {
        const file = await fileFromUrl(sub.image, "subcategory-image")
        if (file) formData.append("image", file)
      }
      return createSubCategory(formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.subCategories(variables.categoryId) })
      notify.success({ title: "Success", message: `Sub-category "${variables.sub.name}" added.` })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, subId, data }: { categoryId: string; subId: string; data: Partial<SubCategory> }) => {
      const formData = new FormData()
      if (data.name) formData.append("title", data.name)
      if (data.image) {
        const file = await fileFromUrl(data.image, "subcategory-image")
        if (file) formData.append("image", file)
      }
      return updateSubCategory(subId, formData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      if (variables.categoryId) {
        queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.subCategories(variables.categoryId) })
      }
      notify.success({ title: "Updated", message: "Sub-category changes saved." })
    },
    onError: (error) => handleApiError(error),
  })
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, subId }: { categoryId: string; subId: string }) => {
      return deleteSubCategory(subId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all })
      if (variables.categoryId) {
        queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.subCategories(variables.categoryId) })
      }
      notify.success({ title: "Deleted", message: "Sub-category removed." })
    },
    onError: (error) => handleApiError(error),
  })
}
