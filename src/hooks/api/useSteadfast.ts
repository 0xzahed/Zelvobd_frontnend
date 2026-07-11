import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch, BASE_URL } from '@/src/api/mainApi';
import { notify } from '@/lib/notify';

export type FraudStatus = {
  total_parcels: number;
  total_delivered: number;
  total_cancelled: number;
  total_fraud_reports: any[];
};

export const getFraudStatus = async (phone: string): Promise<FraudStatus> => {
  const response = await adminFetch(`${BASE_URL}/steadfast/fraud-check/${phone}`);
  const payload = await response.json();

  if (!response.ok || payload?.status === false) {
    throw new Error(payload?.message || 'Failed to check fraud status');
  }

  return payload.data;
};

export const useFraudCheck = (phone: string | null) => {
  return useQuery({
    queryKey: ['fraudCheck', phone],
    queryFn: () => getFraudStatus(phone!),
    enabled: !!phone,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

export const syncOrdersToSteadfast = async (orderIds: string[]) => {
  const response = await adminFetch(`${BASE_URL}/steadfast/sync-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderIds }),
  });
  
  const payload = await response.json();

  if (!response.ok || payload?.status === false) {
    throw new Error(payload?.message || 'Failed to sync orders to Steadfast');
  }

  return payload.data;
};

export const useSyncOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncOrdersToSteadfast,
    onSuccess: (data) => {
      notify.success(`Successfully synced ${data.success} order(s) to Steadfast!`);
      if (data.failed > 0) {
        notify.error(`Failed to sync ${data.failed} order(s). Check logs.`);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      notify.error(error.message || 'Failed to sync orders');
    },
  });
};

export type DeliveryStatusResponse = {
  status: number;
  delivery_status: string;
};

export const getDeliveryStatus = async (invoice: string): Promise<DeliveryStatusResponse> => {
  const response = await adminFetch(`${BASE_URL}/steadfast/status/${invoice}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to check delivery status');
  }

  return payload.data;
};

export const useSteadfastDeliveryStatus = (invoice: string | null) => {
  return useQuery({
    queryKey: ['steadfastDeliveryStatus', invoice],
    queryFn: () => getDeliveryStatus(invoice!),
    enabled: !!invoice,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
