"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, ShieldAlert } from "lucide-react"
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
import { OrderCard } from "./order-card"
import { useFraudCheck, useSyncOrders } from "@/src/hooks/api/useSteadfast"

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
  const [fraudPhone, setFraudPhone] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const { data, isLoading } = useOrders({
    page,
    limit: 20,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  })

  const orders = data?.orders || []
  const meta = data?.meta

  const { data: fraudData, isLoading: isFraudLoading, isError: isFraudError, error: fraudError } = useFraudCheck(fraudPhone)

  const updateStatusMutation = useUpdateOrderStatus()
  const deleteMutation = useDeleteOrder()
  const syncOrdersMutation = useSyncOrders()
  const confirm = useConfirm()

  const handleSyncSteadfast = async (orderId: string) => {
    const ok = await confirm({
      title: "Send to Steadfast Courier",
      message: `Are you sure you want to send this order to Steadfast? Its local status will automatically update to PROCESSING.`,
      confirmText: "Sync Order"
    });

    if (ok) {
      syncOrdersMutation.mutate([orderId]);
    }
  }

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
          </AdminToolbar>
        }
      />

      <AdminPanel>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full">
              <AdminLoadingState label="Loading orders..." />
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full">
              <AdminEmptyState
                icon={ShoppingCart}
                title="No orders found"
                description="There are no orders matching your filters at the moment."
              />
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onDelete={handleDelete}
                onFraudCheck={(phone) => setFraudPhone(phone)} 
                onStatusChange={handleStatusChange}
                onSyncSteadfast={showSteadfast ? handleSyncSteadfast : undefined}
                isSyncing={syncOrdersMutation.isPending}
              />
            ))
          )}
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

      {/* Fraud Modal Placeholder */}
      {fraudPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl">
            <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldAlert className="h-5 w-5 text-orange-500" />
                Fraud Check
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Checking fraud status for phone: <span className="font-bold text-foreground">{fraudPhone}</span>
              </p>
              
              {isFraudLoading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-xs text-muted-foreground">Contacting Steadfast...</p>
                </div>
              ) : isFraudError ? (
                <div className="text-xs text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 text-left">
                  <p className="font-semibold mb-1">Error checking status:</p>
                  <p>{fraudError instanceof Error ? fraudError.message : "Unknown error occurred"}</p>
                </div>
              ) : fraudData ? (
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Total Parcels</p>
                    <p className="text-lg font-bold text-foreground">{fraudData.total_parcels}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="text-lg font-bold text-green-600">{fraudData.total_delivered}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">Cancelled</p>
                    <p className="text-lg font-bold text-red-600">{fraudData.total_cancelled}</p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs font-medium text-orange-800">Fraud Reports</p>
                    <p className="text-lg font-bold text-orange-600">
                      {fraudData.total_fraud_reports?.length || 0}
                    </p>
                  </div>
                  
                  {/* Steadfast Ratio Info */}
                  <div className="col-span-2 mt-2 rounded-lg border border-border/50 bg-card p-3">
                    <p className="text-xs text-muted-foreground text-center">
                      Success Rate: <span className="font-bold text-foreground">
                        {fraudData.total_parcels > 0 
                          ? Math.round((fraudData.total_delivered / fraudData.total_parcels) * 100) 
                          : 0}%
                      </span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-border/50 bg-muted/20 px-4 py-3">
              <button
                onClick={() => setFraudPhone(null)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
