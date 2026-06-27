import { OrderList } from "@/components/admin/order-list"

export default function TrashOrdersPage() {
  return (
    <OrderList
      title="Trash Orders"
      description="Deleted or trashed orders"
      defaultStatus="TRASH"
      lockStatus
    />
  )
}
