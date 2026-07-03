import { redirect } from "next/navigation"

export default function OrdersIndexPage() {
  redirect("/admin/orders/pending")
}
