"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Truck, ShieldAlert, Trash2, Package, Phone, MapPin, ChevronLeft, ChevronRight, Loader2, FileText, Pencil, X, Plus, Save } from "lucide-react"
import { purchase } from "@/lib/pixel"
import { useOrders, useUpdateOrderStatus, useUpdateOrder, useDeleteOrder, type Order, type OrderStatus, type OrderItem } from "@/src/hooks/api/useOrders"
import { useProducts } from "@/src/hooks/api/useProducts"
import type { Product, ProductVariant } from "@/lib/types"
import { useFraudCheck, useSteadfastDeliveryStatus, useSyncOrders } from "@/src/hooks/api/useSteadfast"
import { formatBDT, formatRelativeTime } from "@/lib/format"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { DashPage, DashHeader, DashPanel, DashStatusBadge, DashLoading, DashEmptyState } from "./dash-ui"
import { notify } from "@/lib/notify"

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  HOLD: "Hold",
  PICKUP: "Pickup",
  DELIVERED: "Delivered",
  CUSTOMER_CANCELLED: "Cancelled",
  CANCELLED: "Cancelled",
  TRASH: "Trash",
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  PROCESSING: "bg-blue-50 text-blue-600 border-blue-100",
  HOLD: "bg-purple-50 text-purple-600 border-purple-100",
  PICKUP: "bg-cyan-50 text-cyan-600 border-cyan-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CUSTOMER_CANCELLED: "bg-red-50 text-red-600 border-red-100",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  TRASH: "bg-gray-100 text-gray-700 border-gray-200",
}

type OrderListProps = {
  status: OrderStatus
  title: string
  subtitle?: string
  showSteadfast?: boolean
}

function OrderCard({
  order,
  onDelete,
  onEdit,
  onFraudCheck,
  onStatusChange,
  onSyncSteadfast,
  isSyncing,
}: {
  order: Order
  onDelete: (o: Order) => void
  onEdit: (o: Order) => void
  onFraudCheck: (phone: string) => void
  onStatusChange?: (id: string, status: OrderStatus) => void
  onSyncSteadfast?: (id: string) => void
  isSyncing?: boolean
}) {
  const { data: steadfastStatus, isLoading: statusLoading } = useSteadfastDeliveryStatus(
    order.consignmentId ? order.code : null
  )

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border/30 bg-muted/10 p-4">
        <div>
          <h3 className="text-sm font-bold text-primary">#{order.code}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatRelativeTime(order.createdAt)}
          </p>
        </div>
        {onStatusChange ? (
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-white text-foreground">
                {label}
              </option>
            ))}
          </select>
        ) : (
          <DashStatusBadge status={order.status} label={STATUS_LABELS[order.status] || order.status} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* Customer Info */}
        <div className="mb-3 space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {order.customerPhone}
          </p>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">{order.address}, {order.district}</span>
          </p>
        </div>

        {/* Courier Info */}
        <div className="mb-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Package className="h-3.5 w-3.5" />
            Courier Status
          </div>
          <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground/70">Consignment:</span>{" "}
              {order.consignmentId || "-"}
            </p>
            <p>
              <span className="font-semibold text-foreground/70">Tracking:</span>{" "}
              {order.trackingCode ? (
                <span className="font-mono text-primary">{order.trackingCode}</span>
              ) : (
                "-"
              )}
            </p>
            <div className="mt-1.5 border-t border-primary/10 pt-1.5">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground/70">Live Status:</span>
                {order.consignmentId ? (
                  statusLoading ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Fetching...
                    </span>
                  ) : steadfastStatus ? (
                    <span className="font-semibold capitalize text-primary">
                      {steadfastStatus.delivery_status?.replace(/_/g, " ") || "Unknown"}
                    </span>
                  ) : (
                    <span className="text-red-500">Failed</span>
                  )
                ) : (
                  <span className="text-muted-foreground">Not synced yet</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="mb-3 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
            <ul className="space-y-1.5">
              {order.items.map((item, idx) => (
                <li key={item.id || idx} className="flex items-center gap-2 rounded-md bg-muted/20 p-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground line-clamp-1">{item.productName}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {[item.color, item.size].filter(Boolean).join(" \u2022 ") || "\u00a0"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium">{formatBDT(Number(item.price))}</p>
                    <p className="text-muted-foreground">x{item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="mb-3 mt-auto rounded-lg border border-border/30 bg-muted/5 p-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatBDT(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{formatBDT(Number(order.shippingCharge))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between py-1 text-primary">
              <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
              <span className="font-medium">-{formatBDT(Number(order.discountAmount))}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-border/30 pt-2 font-bold text-foreground">
            <span>Total</span>
            <span>{formatBDT(Number(order.total))}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/admin/orders/invoice/${order.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <FileText className="h-3.5 w-3.5" />
            Invoice
          </Link>
          {onSyncSteadfast && !order.consignmentId && (
            <button
              onClick={() => onSyncSteadfast(order.id)}
              disabled={isSyncing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
            >
              <Truck className="h-3.5 w-3.5" />
              Send to Steadfast
            </button>
          )}
          <button
            onClick={() => onFraudCheck(order.customerPhone)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Fraud Check
          </button>
          <button
            onClick={() => onEdit(order)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground transition hover:bg-secondary"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(order)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function FraudCheckModal({ phone, onClose }: { phone: string | null; onClose: () => void }) {
  const { data, isLoading, isError, error } = useFraudCheck(phone)

  if (!phone) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground">Fraud Check</h3>
        <p className="mt-1 text-sm text-muted-foreground">Phone: <span className="font-semibold text-foreground">{phone}</span></p>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-red-500">{(error as any)?.message || "Failed to check fraud status"}</p>
        ) : data ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Total Parcels", value: data.total_parcels, color: "text-foreground" },
              { label: "Delivered", value: data.total_delivered, color: "text-emerald-600" },
              { label: "Cancelled", value: data.total_cancelled, color: "text-red-600" },
              {
                label: "Fraud Reports",
                value: Array.isArray(data.total_fraud_reports) ? data.total_fraud_reports.length : 0,
                color: "text-orange-600",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
            {data.total_parcels > 0 && (
              <div className="col-span-2 rounded-lg bg-orange-50 p-3 text-center text-xs">
                <span className="font-semibold text-orange-600">Success Rate: </span>
                <span className="text-orange-700">
                  {((data.total_delivered / data.total_parcels) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        ) : null}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function EditOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const updateOrder = useUpdateOrder()
  const { data: productsData } = useProducts({ limit: 1000 })
  const products = (productsData as Product[]) || []
  const [draft, setDraft] = useState({
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: order.address,
    district: order.district,
    union: order.union || "",
    orderNotes: order.orderNotes || "",
    shippingCharge: Number(order.shippingCharge),
    discountAmount: Number(order.discountAmount),
    promoCode: order.promoCode || "",
    items: order.items.map((item) => ({ ...item, price: Number(item.price) })),
  })

  const subtotal = useMemo(
    () => draft.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [draft.items]
  )
  const total = useMemo(
    () => Math.max(0, subtotal + draft.shippingCharge - draft.discountAmount),
    [subtotal, draft.shippingCharge, draft.discountAmount]
  )

  const updateItem = (idx: number, field: keyof OrderItem, value: string | number | null) => {
    setDraft((prev) => {
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value } as OrderItem
      return { ...prev, items }
    })
  }

  const applyProductToItem = (idx: number, productId: string, variantId?: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const variant = variantId
      ? product.variants?.find((v) => v.id === variantId)
      : product.variants?.[0]
    if (!variant) return
    setDraft((prev) => {
      const items = [...prev.items]
      items[idx] = {
        ...items[idx],
        productId: product.id,
        productName: product.name,
        productImage: variant.image || null,
        price: variant.discountedPrice,
        color: variant.color || null,
        size: variant.size || null,
      } as OrderItem
      return { ...prev, items }
    })
  }

  const removeItem = (idx: number) => {
    setDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  const addItem = () => {
    setDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: "",
          orderId: order.id,
          productId: "",
          productName: "",
          productImage: null,
          price: 0,
          quantity: 1,
          color: null,
          size: null,
        },
      ],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (draft.items.length === 0) {
      notify.error({ title: "Error", message: "At least one item is required." })
      return
    }
    updateOrder.mutate(
      {
        id: order.id,
        data: {
          customerName: draft.customerName,
          customerPhone: draft.customerPhone,
          address: draft.address,
          district: draft.district,
          union: draft.union || null,
          orderNotes: draft.orderNotes || null,
          shippingCharge: draft.shippingCharge,
          discountAmount: draft.discountAmount,
          promoCode: draft.promoCode || null,
          items: draft.items.map((item) => ({
            productId: item.productId || undefined,
            productName: item.productName,
            productImage: item.productImage,
            price: Number(item.price),
            quantity: Number(item.quantity),
            color: item.color || null,
            size: item.size || null,
          })),
        },
      },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Edit Order #{order.code}</h3>
            <p className="text-xs text-muted-foreground">Update customer details, items and prices.</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer Details</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Name</label>
                  <input
                    required
                    value={draft.customerName}
                    onChange={(e) => setDraft((p) => ({ ...p, customerName: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Phone</label>
                  <input
                    required
                    value={draft.customerPhone}
                    onChange={(e) => setDraft((p) => ({ ...p, customerPhone: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground">Address</label>
                  <input
                    required
                    value={draft.address}
                    onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">District</label>
                  <input
                    required
                    value={draft.district}
                    onChange={(e) => setDraft((p) => ({ ...p, district: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Union / Area</label>
                  <input
                    value={draft.union}
                    onChange={(e) => setDraft((p) => ({ ...p, union: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>
              <div className="space-y-2">
                {draft.items.map((item, idx) => {
                  const selectedProduct = products.find((p) => p.id === item.productId)
                  const variants = selectedProduct?.variants || []
                  return (
                    <div key={idx} className="rounded-lg border border-border/40 bg-muted/10 p-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-medium uppercase text-muted-foreground">Product</label>
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => applyProductToItem(idx, e.target.value)}
                            className="mt-1 h-8 w-full rounded-md border border-border/60 bg-card px-2 text-sm outline-none focus:border-primary/40"
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-medium uppercase text-muted-foreground">Variant</label>
                          <select
                            value={variants.find((v) => (v.color || "") === (item.color || "") && (v.size || "") === (item.size || ""))?.id || ""}
                            onChange={(e) => applyProductToItem(idx, item.productId, e.target.value || undefined)}
                            disabled={variants.length === 0}
                            className="mt-1 h-8 w-full rounded-md border border-border/60 bg-card px-2 text-sm outline-none focus:border-primary/40 disabled:opacity-50"
                          >
                            <option value="">{variants.length === 0 ? "Select product first" : "Select variant"}</option>
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {[v.color, v.size].filter(Boolean).join(" / ") || "Default"}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-medium uppercase text-muted-foreground">Price</label>
                          <input
                            required
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.price}
                            onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                            className="mt-1 h-8 w-full rounded-md border border-border/60 bg-card px-2 text-sm outline-none focus:border-primary/40"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-medium uppercase text-muted-foreground">Qty</label>
                          <input
                            required
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                            className="mt-1 h-8 w-full rounded-md border border-border/60 bg-card px-2 text-sm outline-none focus:border-primary/40"
                          />
                        </div>
                        <div className="flex items-end sm:col-span-1">
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="grid h-8 w-full place-items-center rounded-md bg-red-50 text-red-500 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Shipping Charge</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={draft.shippingCharge}
                    onChange={(e) => setDraft((p) => ({ ...p, shippingCharge: Number(e.target.value) }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Discount</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={draft.discountAmount}
                    onChange={(e) => setDraft((p) => ({ ...p, discountAmount: Number(e.target.value) }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Promo Code</label>
                  <input
                    value={draft.promoCode}
                    onChange={(e) => setDraft((p) => ({ ...p, promoCode: e.target.value }))}
                    className="h-9 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
              <div className="flex justify-between rounded-lg border border-border/40 bg-muted/10 p-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-border/40 bg-muted/10 p-3 text-sm font-bold text-foreground">
                <span>Total</span>
                <span>{formatBDT(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/60 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateOrder.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            {updateOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

const ROWS_PER_PAGE = 12

export function OrderList({ status, title, subtitle, showSteadfast }: OrderListProps) {
  const { data: ordersData, isLoading } = useOrders({})
  const updateStatus = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()
  const syncMutation = useSyncOrders()
  const confirm = useConfirm()
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [fraudPhone, setFraudPhone] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const orders: Order[] = useMemo(() => {
    const list = (ordersData as any)?.orders || []
    return list.filter((o: Order) => o.status === status)
  }, [ordersData, status])

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim()
    if (!lc) return orders
    return orders.filter(
      (o) =>
        o.code?.toLowerCase().includes(lc) ||
        o.customerName?.toLowerCase().includes(lc) ||
        o.customerPhone?.includes(lc)
    )
  }, [orders, q])

  const paginated = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE
    return filtered.slice(start, start + ROWS_PER_PAGE)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          if (newStatus === "PROCESSING") {
            const order = orders.find((o) => o.id === id)
            if (order) {
              purchase({ value: Number(order.subtotal || order.total || 0), orderId: order.code })
            }
          }
        },
      }
    )
  }

  const handleDelete = async (order: Order) => {
    const ok = await confirm({
      title: "Delete Order",
      message: `Are you sure you want to delete order #${order.code}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    })
    if (ok) deleteMutation.mutate(order.id)
  }

  const handleSyncOrder = (orderId: string) => {
    syncMutation.mutate([orderId], {
      onSuccess: () => {
        const order = orders.find((o) => o.id === orderId)
        if (order) {
          purchase({ value: Number(order.subtotal || order.total || 0), orderId: order.code })
        }
      },
    })
  }

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title={title} subtitle={subtitle} />
        <DashLoading label="Loading orders..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader title={title} subtitle={subtitle} />

      <DashPanel className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card px-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="Search by order code, name or phone..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {showSteadfast && (
            <button
              onClick={() => {
                const orderIds = filtered.map((o) => o.id)
                if (orderIds.length > 0) {
                  syncMutation.mutate(orderIds, {
                    onSuccess: () => {
                      filtered.forEach((o) => {
                        purchase({ value: Number(o.subtotal || o.total || 0), orderId: o.code })
                      })
                    },
                  })
                }
              }}
              disabled={syncMutation.isPending || filtered.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              Sync All to Steadfast
            </button>
          )}
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </DashPanel>

      {filtered.length === 0 ? (
        <DashEmptyState icon={Package} title="No orders found" description={`No ${title.toLowerCase()} at the moment.`} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={handleDelete}
                onEdit={setEditingOrder}
                onFraudCheck={setFraudPhone}
                onStatusChange={handleStatusChange}
                onSyncSteadfast={handleSyncOrder}
                isSyncing={syncMutation.isPending}
              />
            ))}
          </div>

          {filtered.length > ROWS_PER_PAGE && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-8 rounded-lg text-sm font-medium transition ${
                      page === p ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {fraudPhone && <FraudCheckModal phone={fraudPhone} onClose={() => setFraudPhone(null)} />}
      {editingOrder && <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} />}
    </DashPage>
  )
}
