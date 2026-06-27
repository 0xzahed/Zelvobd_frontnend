import { OrderList } from "@/components/admin/order-list"

export default function NewOrdersPage() {
  return (
    <OrderList
      title="All Orders"
      description="Search and manage all store orders"
      defaultStatus=""
    />
  )
}
