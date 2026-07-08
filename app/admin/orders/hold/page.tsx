import { OrderList } from "@/dashboard/components/order-list"

export default function HoldOrdersPage() {
  return <OrderList status="HOLD" title="Hold Orders" subtitle="Orders that are on hold" showSteadfast />
}
