import { OrderList } from "@/dashboard/components/order-list"

export default function CustomerCancelledOrdersPage() {
  return (
    <OrderList
      status="CUSTOMER_CANCELLED"
      title="Customer Cancelled Orders"
      subtitle="Orders cancelled by customers"
    />
  )
}
