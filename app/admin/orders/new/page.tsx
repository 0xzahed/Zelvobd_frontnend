"use client"

import { useState } from "react"
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-dialog"
import {
  useOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  type Order,
  type OrderStatus,
} from "@/src/hooks/api/useOrders"
import { formatBDT } from "@/lib/format"
import Link from "next/link"

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "HOLD", label: "Hold" },
  { value: "PICKUP", label: "Pickup" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CUSTOMER_CANCELLED", label: "Customer Cancelled" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "TRASH", label: "Trash" },
]

export default function NewOrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")

  // Only filtering by 'search' or 'statusFilter' explicitly. The user asked for "New Orders" 
  // page, but wanted to configure status and search. We default to empty string to show all initially,
  // or they can change it. 
  // We'll set the limit to 20.
  const { data, isLoading } = useOrders({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  })

  const orders = data?.orders || []
  const meta = data?.meta

  const updateStatusMutation = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()
  const confirm = useConfirm()

  const handleDelete = async (order: Order) => {
    const ok = await confirm({
      title: "Delete Order?",
      message: `Are you sure you want to delete order ${order.code}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) {
      deleteMutation.mutate(order.id)
    }
  }

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus })
  }

  // Handle Search Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1) // Reset to first page on new search
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Orders</h2>
          <p className="text-xs text-muted-foreground">
            {meta?.total ? `${meta.total} total orders` : "Loading..."}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="flex h-10 min-w-0 flex-3 items-center gap-2 rounded-sm bg-card px-3 shadow-sm md:w-64">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search code, name, phone..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | "")
              setPage(1)
            }}
            className="h-10 rounded-sm border-0 bg-card px-3 text-sm text-foreground shadow-sm outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/60 transition hover:bg-secondary/50 last:border-b-0"
                  >
                    <td className="px-5 py-3">
                      <div className="font-bold tracking-wide text-primary">{order.code}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {order.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} <br />
                      <span className="text-xs">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {order.total}
                      {order.promoCode && (
                        <div className="text-[10px] text-accent mt-0.5 font-semibold">
                          PROMO: {order.promoCode}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                        className={`h-8 rounded-md border border-border/60 bg-transparent px-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary ${
                          order.status === 'PENDING' ? 'text-blue-600 bg-blue-50' :
                          order.status === 'DELIVERED' ? 'text-green-600 bg-green-50' :
                          order.status === 'CANCELLED' || order.status === 'CUSTOMER_CANCELLED' ? 'text-red-600 bg-red-50' :
                          'text-foreground'
                        }`}
                      >
                        {STATUS_OPTIONS.filter(opt => opt.value !== "").map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {/* Detail view would go here. For now, it's just an icon without a dedicated page */}
                        <button
                          aria-label="View Details"
                          className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(order)}
                          disabled={deleteMutation.isPending}
                          aria-label="Delete"
                          className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing page {meta.page} of {meta.totalPage}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-transparent text-foreground transition hover:bg-secondary disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                disabled={page === meta.totalPage}
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-transparent text-foreground transition hover:bg-secondary disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
