import { OrderList } from "@/components/admin/order-list"

export default function CancelledOrdersPage() {
  return <OrderList title="Cancelled Order List" status="Cancelled" />
}
