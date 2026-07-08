import { OrderList } from "@/dashboard/components/order-list"

export default function DeliveredOrdersPage() {
  return <OrderList status="DELIVERED" title="Delivered Orders" subtitle="Successfully delivered orders" />
}
