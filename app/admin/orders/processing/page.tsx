import { OrderList } from "@/dashboard/components/order-list"

export default function ProcessingOrdersPage() {
  return <OrderList status="PROCESSING" title="Processing Orders" subtitle="Orders that are being processed" showSteadfast />
}
