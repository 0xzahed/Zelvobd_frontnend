import { OrderList } from "@/dashboard/components/order-list"

export default function CancelledOrdersPage() {
  return <OrderList status="CANCELLED" title="Cancelled Orders" subtitle="Orders that have been cancelled" />
}
