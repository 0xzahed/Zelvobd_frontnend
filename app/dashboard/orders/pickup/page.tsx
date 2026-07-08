import { OrderList } from "@/dashboard/components/order-list"

export default function PickupOrdersPage() {
  return <OrderList status="PICKUP" title="Pickup Orders" subtitle="Orders ready for pickup" showSteadfast />
}
