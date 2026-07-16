import { OrderList } from "@/dashboard/components/order-list"

export default function TrashOrdersPage() {
  return (
    <OrderList
      status="TRASH"
      title="Trash Orders"
      subtitle="Trashed orders are stored here indefinitely. Restore them anytime or delete permanently."
    />
  )
}
