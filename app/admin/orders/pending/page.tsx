import { OrderList } from "@/components/admin/order-list"

export default function PendingOrdersPage() {
  return (
    <OrderList
      title="Pending Orders"
      description="Orders awaiting confirmation"
      defaultStatus="PENDING"
      lockStatus
      showSteadfast
    />
  )
}
