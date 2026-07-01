import { handleApiError } from '@/lib/api-utils';
import { notify } from '@/lib/notify';
import type { CategoryBanner } from '@/lib/types';
import { adminFetch } from '@/src/api/_shared/adminFetch';
import { BASE_URL } from '@/src/api/_shared/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategoryBanners() {
  return useQuery<CategoryBanner[]>({
    queryKey: ['categoryBanners'],
    queryFn: async () => {
      const response = await adminFetch(`${BASE_URL}/category-banners`, {
        method: 'GET',
      });
      const payload = await response.json();
      if (!response.ok || payload?.status === false) {
        throw payload || { message: 'Failed to fetch category banners' };
      }
      return payload.data;
    },
  });
}

export function useCreateCategoryBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await adminFetch(`${BASE_URL}/category-banners`, {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok || payload?.status === false) {
        throw payload || { message: 'Failed to create category banner' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryBanners'] });
      notify.success({ title: 'Success', message: 'Category Banner created successfully' });
    },
    onError: (error) => handleApiError(error),
  });
}

export function useUpdateCategoryBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await adminFetch(`${BASE_URL}/category-banners/${id}`, {
        method: 'PATCH',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok || payload?.status === false) {
        throw payload || { message: 'Failed to update category banner' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryBanners'] });
      notify.success({ title: 'Success', message: 'Category Banner updated successfully' });
    },
    onError: (error) => handleApiError(error),
  });
}

export function useDeleteCategoryBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`${BASE_URL}/category-banners/${id}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok || payload?.status === false) {
        throw payload || { message: 'Failed to delete category banner' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryBanners'] });
      notify.success({ title: 'Success', message: 'Category Banner deleted successfully' });
    },
    onError: (error) => handleApiError(error),
  });
}
