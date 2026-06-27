import { OrderList } from "@/components/admin/order-list"

export default function PickupOrdersPage() {
  return (
    <OrderList
      title="Pickup Orders"
      description="Orders ready for pickup"
      defaultStatus="PICKUP"
      lockStatus
    />
  )
}
