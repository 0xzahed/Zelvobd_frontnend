import { OrderList } from "@/components/admin/order-list"

export default function ProcessingOrdersPage() {
  return (
    <OrderList
      title="Processing Orders"
      description="Orders being prepared for shipment"
      defaultStatus="PROCESSING"
      lockStatus
      showSteadfast
    />
  )
}
