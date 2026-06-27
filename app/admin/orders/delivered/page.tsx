import { OrderList } from "@/components/admin/order-list"

export default function DeliveredOrdersPage() {
  return (
    <OrderList
      title="Delivered Orders"
      description="Successfully delivered orders"
      defaultStatus="DELIVERED"
      lockStatus
    />
  )
}
