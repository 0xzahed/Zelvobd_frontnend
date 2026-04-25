import { OrderList } from "@/components/admin/order-list"

export default function CustomerCancelledOrdersPage() {
  return (
    <OrderList
      title="Customer Cancelled Order List"
      status="Customer Cancelled"
    />
  )
}
