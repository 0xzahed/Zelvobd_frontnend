import { OrderList } from "@/components/admin/order-list"

export default function HoldOrdersPage() {
  return (
    <OrderList
      title="Hold Orders"
      description="Orders on hold"
      defaultStatus="HOLD"
      lockStatus
    />
  )
}
