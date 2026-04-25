import { OrderList } from "@/components/admin/order-list"

export default function ProcessingOrdersPage() {
  return (
    <OrderList title="Processing Order List" status="Processing" showSteadfast />
  )
}
