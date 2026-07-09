import { useQuery } from "@tanstack/react-query"
import { getCustomers, getCustomerStats, type Customer, type CustomerStats, type GetCustomersParams } from "@/src/api/customerApi"

export const CUSTOMER_KEYS = {
  all: ["customers"] as const,
  list: (params: any) => ["customers", "list", params] as const,
  stats: () => ["customers", "stats"] as const,
}

export type { Customer, CustomerStats, GetCustomersParams }

export function useCustomers(params: GetCustomersParams) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(params),
    queryFn: () => getCustomers(params),
  })
}

export function useCustomerStats() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.stats(),
    queryFn: () => getCustomerStats(),
  })
}
