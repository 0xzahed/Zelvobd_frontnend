"use client"

import { useState } from "react"
import { Eye, Trash2, ShieldAlert, Package, CheckCircle2 } from "lucide-react"
import type { Order, OrderStatus } from "@/src/hooks/api/useOrders"
import { formatBDT } from "@/lib/format"
import { AdminIconButton } from "@/components/admin/admin-ui"

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "text-blue-600 bg-blue-50 border-blue-100",
  PROCESSING: "text-indigo-600 bg-indigo-50 border-indigo-100",
  HOLD: "text-purple-600 bg-purple-50 border-purple-100",
  PICKUP: "text-cyan-600 bg-cyan-50 border-cyan-100",
  DELIVERED: "text-green-600 bg-green-50 border-green-100",
  CUSTOMER_CANCELLED: "text-red-600 bg-red-50 border-red-100",
  CANCELLED: "text-red-600 bg-red-50 border-red-100",
  TRASH: "text-gray-600 bg-gray-100 border-gray-200",
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  HOLD: "Hold",
  PICKUP: "Pickup",
  DELIVERED: "Delivered",
  CUSTOMER_CANCELLED: "Customer Cancelled",
  CANCELLED: "Cancelled",
  TRASH: "Trash",
}

type OrderCardProps = {
  order: Order
  onDelete: (order: Order) => void
  onFraudCheck: (phone: string) => void
}

export function OrderCard({ order, onDelete, onFraudCheck }: OrderCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header section */}
      <div className="flex items-start justify-between border-b border-border/50 bg-muted/20 p-4">
        <div>
          <h3 className="text-sm font-bold text-primary">{order.code}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Customer Details */}
        <div className="mb-4 space-y-1">
          <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
          <p className="text-xs text-muted-foreground line-clamp-2" title={order.address}>
            {order.address}, {order.district}
          </p>
        </div>

        {/* Steadfast Info */}
        <div className="mb-4 flex flex-col gap-1 rounded-lg border border-primary/10 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Package className="h-3.5 w-3.5" />
            Courier Status
          </div>
          {order.trackingCode || order.consignmentId ? (
            <div className="mt-1 space-y-1 text-xs text-muted-foreground">
              {order.consignmentId && (
                <p>
                  <span className="font-semibold text-foreground/80">Consignment:</span>{" "}
                  {order.consignmentId}
                </p>
              )}
              {order.trackingCode && (
                <p>
                  <span className="font-semibold text-foreground/80">Tracking:</span>{" "}
                  <span className="font-mono text-primary">{order.trackingCode}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Not synced with Steadfast yet</p>
          )}
        </div>

        {/* Payment Breakdown */}
        <div className="mb-4 mt-auto rounded-lg border border-border/50 bg-muted/10 p-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Items ({order.items.length})</span>
            <span className="font-medium">{formatBDT(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{formatBDT(order.shippingCharge)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between py-1 text-primary">
              <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
              <span className="font-medium">-{formatBDT(order.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-border/50 pt-2 font-bold text-foreground">
            <span>Total</span>
            <span>{formatBDT(order.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onFraudCheck(order.customerPhone)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Fraud Check
          </button>
          
          <AdminIconButton aria-label="View Details" variant="primary">
            <Eye className="h-4 w-4" />
          </AdminIconButton>
          
          <AdminIconButton
            aria-label="Delete"
            variant="danger"
            onClick={() => onDelete(order)}
          >
            <Trash2 className="h-4 w-4" />
          </AdminIconButton>
        </div>
      </div>
    </div>
  )
}
