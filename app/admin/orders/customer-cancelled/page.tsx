import { OrderList } from "@/components/admin/order-list"

export default function CustomerCancelledOrdersPage() {
  return (
    <OrderList
      title="Customer Cancelled"
      description="Orders cancelled by customers"
      defaultStatus="CUSTOMER_CANCELLED"
      lockStatus
    />
  )
}
