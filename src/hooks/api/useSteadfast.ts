import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/src/api/_shared/adminFetch';
import { BASE_URL } from '@/src/api/_shared/client';

export type FraudStatus = {
  Total_parcels: number;
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
