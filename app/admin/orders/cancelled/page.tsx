import { OrderList } from "@/components/admin/order-list"

export default function CancelledOrdersPage() {
  return (
    <OrderList
      title="Cancelled Orders"
      description="Orders cancelled by admin"
      defaultStatus="CANCELLED"
      lockStatus
    />
  )
}
