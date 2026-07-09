import { OrderList } from "@/dashboard/components/order-list"

export default function PendingOrdersPage() {
  return <OrderList status="PENDING" title="Pending Orders" subtitle="Orders awaiting confirmation" />
}
