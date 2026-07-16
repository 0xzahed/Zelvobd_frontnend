import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch, BASE_URL } from '@/src/api/mainApi';
import { notify } from '@/lib/notify';
import { handleApiError } from '@/lib/api-utils';

export type LandingPagePayload = {
  id?: string;
  slug: string;
  colorPalette: string;
  productId?: string;
  heroSection?: any;
  tableSection?: any;
  featureCards?: any;
  timerSection?: any;
  videoSection?: any;
  bulletPointsSection?: any;
  tipsSection?: any;
  checkoutSection?: any;
  faqSection?: any;
  whatsappSection?: any;
};

export const useLandingPages = () => {
  return useQuery({
    queryKey: ['landing-pages'],
    queryFn: async () => {
      const res = await adminFetch(`${BASE_URL}/landing-pages`, {
        method: 'GET',
      });
      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw payload || { message: 'Failed to fetch landing pages' };
      }
      return payload.data as LandingPagePayload[];
    },
  });
};

export const useLandingPage = (id: string) => {
  return useQuery({
    queryKey: ['landing-page', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await adminFetch(`${BASE_URL}/landing-pages/${id}`, {
        method: 'GET',
      });
      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw payload || { message: 'Failed to fetch landing page' };
      }
      return payload.data as LandingPagePayload;
    },
    enabled: !!id,
  });
};

export const useCreateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<LandingPagePayload>) => {
      const res = await adminFetch(`${BASE_URL}/landing-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw payload || { message: 'Failed to create landing page' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      notify.success({ title: 'Success', message: 'Landing page created successfully' });
    },
    onError: (error) => handleApiError(error),
  });
};

export const useUpdateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LandingPagePayload> }) => {
      const res = await adminFetch(`${BASE_URL}/landing-pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw payload || { message: 'Failed to update landing page' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      queryClient.invalidateQueries({ queryKey: ['landing-page'] });
      notify.success({ title: 'Success', message: 'Landing page updated successfully' });
    },
    onError: (error) => handleApiError(error),
  });
};

export const useDeleteLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`${BASE_URL}/landing-pages/${id}`, {
        method: 'DELETE',
      });
      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw payload || { message: 'Failed to delete landing page' };
      }
      return payload.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      notify.success({ title: 'Success', message: 'Landing page deleted successfully' });
    },
    onError: (error) => handleApiError(error),
  });
};
