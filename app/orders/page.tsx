"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BackHeader } from "@/components/layout/back-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatBDT } from "@/lib/format"

type OrderStatus = "Pending" | "Confirmed" | "Cancelled" | "Rejected"

type OrderRow = {
  code: string
  status: OrderStatus
  amount: number
  phone?: string
  createdAt: string
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
  Rejected: "bg-red-100 text-red-700",
}

export default function OrdersPage() {
  const params = useSearchParams()
  const focusCode = params.get("code") || ""
  const [orders, setOrders] = useState<OrderRow[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("customer_orders")
      const parsed = raw ? JSON.parse(raw) : []
      const rows = Array.isArray(parsed) ? parsed : []
      const normalized = rows.map((row: any) => {
        const status = String(row?.status || "Pending") as OrderStatus
        return {
          code: String(row?.code || ""),
          status: ["Pending", "Confirmed", "Cancelled", "Rejected"].includes(status)
            ? status
            : "Pending",
          amount: Number(row?.amount || 0),
          phone: String(row?.phone || ""),
          createdAt: String(row?.createdAt || new Date().toISOString()),
        } as OrderRow
      })
      setOrders(normalized)
    } catch {
      setOrders([])
    }
  }, [])

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  )

  return (
    <AppShell>
      <BackHeader title="My Orders" />
      <div className="py-4 md:py-8">
        <div className="mb-4 rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Order Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["Pending", "Confirmed", "Cancelled", "Rejected"] as OrderStatus[]).map((status) => (
              <span
                key={status}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
              >
                {status}
              </span>
            ))}
          </div>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
            No orders found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const focused = focusCode && focusCode === order.code
              return (
                <div
                  key={order.code}
                  className={`rounded-2xl border bg-card p-4 ${
                    focused ? "border-primary ring-1 ring-primary/30" : "border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Tracking Number</p>
                      <p className="font-mono text-sm font-semibold text-foreground">{order.code}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">{formatBDT(order.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{order.phone || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Ordered At</p>
                      <p className="font-medium text-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
