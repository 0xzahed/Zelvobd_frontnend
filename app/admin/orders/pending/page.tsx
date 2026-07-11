"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Eye, Truck, CheckCircle2, Ban, MoreHorizontal } from "lucide-react"
import { useOrders, useUpdateOrderStatus, useDeleteOrder, type Order, type OrderStatus } from "@/src/hooks/api/useOrders"
import { formatBDT, formatRelativeTime, cx } from "@/lib/format"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { notify } from "@/lib/notify"
import { DashPage, DashHeader, DashPanel, DashStatusBadge, DashLoading } from "@/dashboard/components/dash-ui"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  HOLD: "Hold",
  PICKUP: "Pickup",
  DELIVERED: "Delivered",
  CUSTOMER_CANCELLED: "Cancelled",
  CANCELLED: "Cancelled",
  TRASH: "Trash",
}

export default function DashboardOrdersPendingPage() {
  const { data: ordersData, isLoading } = useOrders({})
  const updateStatus = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()
  const confirm = useConfirm()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const orders = (ordersData as any)?.orders || []

  const filtered = useMemo(() => {
    let list = [...orders]
    const lc = q.toLowerCase().trim()
    if (lc) {
      list = list.filter(
        (o: Order) =>
          o.code?.toLowerCase().includes(lc) || o.customerName?.toLowerCase().includes(lc) || (o as any).phone?.includes(lc)
      )
    }
    if (statusFilter !== "all") {
      list = list.filter((o: Order) => o.status === statusFilter)
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, q, statusFilter])

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Orders" subtitle="Manage customer orders" />
        <DashLoading label="Loading orders..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader
        title="Orders"
        subtitle="Manage customer orders"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border/60 bg-surface px-3 text-sm text-foreground outline-none"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Search */}
      <DashPanel className="p-4">
        <div className="flex h-9 min-w-0 max-w-sm items-center gap-2 rounded-lg border border-border/60 bg-surface px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order id or customer"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </DashPanel>

      {/* Orders table */}
      <DashPanel noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-surface/50 text-muted-foreground">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Invoice No</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Order Time</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Customer Name</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Method</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
              {filtered.map((order: Order) => (
                <tr key={order.id} className="border-b border-border/30 transition hover:bg-surface/50">
                  <td className="px-5 py-3.5 font-semibold text-foreground">#{order.code}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatRelativeTime(order.createdAt)}</td>
                  <td className="px-5 py-3.5 text-foreground">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{(order as any).phone}</p>
                  </td>
<td className="px-5 py-3.5 text-muted-foreground">Cash on Delivery</td>
<td className="px-5 py-3.5 font-medium text-foreground">{formatBDT((order as any).totalAmount ?? order.total)}</td>
                  <td className="px-5 py-3.5">
                    <DashStatusBadge status={order.status} label={STATUS_LABELS[order.status] || order.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => updateStatus.mutate({ id: order.id, status: "PROCESSING" as OrderStatus })}
                        disabled={updateStatus.isPending}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-blue-50 hover:text-blue-500 disabled:opacity-50"
                        title="Process"
                      >
                        <Truck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: order.id, status: "DELIVERED" as OrderStatus })}
                        disabled={updateStatus.isPending}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-500 disabled:opacity-50"
                        title="Deliver"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await confirm({ title: "Cancel order?", message: `Cancel order #${order.code}?`, confirmText: "Cancel", variant: "danger" })
                          if (ok) updateStatus.mutate({ id: order.id, status: "CANCELLED" as OrderStatus })
                        }}
                        disabled={updateStatus.isPending}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Cancel"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await confirm({ title: "Delete order?", message: `Delete order #${order.code}?`, confirmText: "Delete", variant: "danger" })
                          if (ok) deleteMutation.mutate(order.id)
                        }}
                        disabled={deleteMutation.isPending}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Delete"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashPanel>
    </DashPage>
  )
}
