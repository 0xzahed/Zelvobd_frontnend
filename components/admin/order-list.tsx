"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Trash2, Truck } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-dialog"
import {
  AdminEmptyState,
  AdminIconButton,
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminPrimaryButton,
  AdminSearchInput,
  AdminSelect,
  AdminToolbar,
} from "@/components/admin/admin-ui"
import {
  useOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  type Order,
  type OrderStatus,
} from "@/src/hooks/api/useOrders"
import { formatBDT } from "@/lib/format"

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "text-blue-600 bg-blue-50",
  PROCESSING: "text-indigo-600 bg-indigo-50",
  HOLD: "text-purple-600 bg-purple-50",
  PICKUP: "text-cyan-600 bg-cyan-50",
  DELIVERED: "text-green-600 bg-green-50",
  CUSTOMER_CANCELLED: "text-red-600 bg-red-50",
  CANCELLED: "text-red-600 bg-red-50",
  TRASH: "text-gray-600 bg-gray-100",
}

type Props = {
  title: string
  description?: string
  defaultStatus?: OrderStatus | ""
  lockStatus?: boolean
  showSteadfast?: boolean
}

export function OrderList({
  title,
  description,
  defaultStatus = "",
  lockStatus = false,
  showSteadfast = false,
}: Props) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">(defaultStatus)

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
    if (ok) deleteMutation.mutate(order.id)
  }

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setPage(1)
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={title}
        description={description}
        count={meta?.total !== undefined ? `${meta.total} orders` : undefined}
        actions={
          <AdminToolbar className="w-full md:w-auto">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search code, name, phone..."
              className="md:w-64"
            />
            {!lockStatus && (
              <AdminSelect
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | "")
                  setPage(1)
                }}
                className="h-10 w-auto min-w-36 shrink-0"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminSelect>
            )}
            {showSteadfast && (
              <AdminPrimaryButton className="bg-secondary text-primary hover:bg-secondary/80">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Steadfast</span>
              </AdminPrimaryButton>
            )}
          </AdminToolbar>
        }
      />

      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
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
                  <td colSpan={6}>
                    <AdminLoadingState label="Loading orders..." />
                  </td>
                </tr>
              )}
              {!isLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      icon={ShoppingCart}
                      title="No orders found"
                      description="There are no orders matching your filters at the moment."
                    />
                  </td>
                </tr>
              )}
              {!isLoading &&
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold tracking-wide text-primary">{order.code}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {order.items.length} item(s)
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {formatBDT(order.total)}
                      {order.promoCode && (
                        <div className="mt-0.5 text-[10px] font-semibold text-accent">
                          PROMO: {order.promoCode}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        disabled={
                          updateStatusMutation.isPending &&
                          updateStatusMutation.variables?.id === order.id
                        }
                        className={`h-8 rounded-lg border border-border/60 px-2 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-primary/20 ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_OPTIONS.filter((opt) => opt.value !== "").map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <AdminIconButton aria-label="View Details" variant="primary">
                          <Eye className="h-3.5 w-3.5" />
                        </AdminIconButton>
                        <AdminIconButton
                          aria-label="Delete"
                          variant="danger"
                          onClick={() => handleDelete(order)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AdminIconButton>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPage > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPage}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                disabled={page === meta.totalPage}
                className="grid h-8 w-8 place-items-center rounded-lg border border-border transition hover:bg-secondary disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  )
}

export function OrdersIndexPage() {
  return (
    <OrderList
      title="All Orders"
      description="Search and manage all store orders"
      defaultStatus=""
    />
  )
}
