"use client"

import { useMemo, useState } from "react"
import { Users, Phone, MapPin, ShoppingBag, Wallet, Calendar, Search, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { useCustomers, useCustomerStats, type Customer } from "@/src/hooks/api/useCustomers"
import { formatBDT, formatRelativeTime } from "@/lib/format"
import { DashPage, DashHeader, DashPanel, DashLoading, DashEmptyState, DashGradientCard } from "./dash-ui"

const PAGE_SIZE = 12

export function CustomerList() {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)

  const { data: customersData, isLoading } = useCustomers({
    page,
    limit: PAGE_SIZE,
    search: q.trim() || undefined,
  })
  const { data: stats } = useCustomerStats()

  const customers: Customer[] = useMemo(
    () => (customersData as any)?.customers || [],
    [customersData],
  )

  const meta = useMemo(
    () => (customersData as any)?.meta || { total: 0, totalPage: 1 },
    [customersData],
  )

  const totalPages = meta.totalPage || 1
  const totalItems = meta.total || 0

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Customers" subtitle="Manage your customers" />
        <DashLoading label="Loading customers..." />
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader title="Customers" subtitle="Manage your customers" />

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashGradientCard
          icon={Users}
          label="Total Customers"
          value={(stats?.totalCustomers ?? 0).toString()}
          subValue="Unique by phone number"
        />
        <DashGradientCard
          icon={ShoppingBag}
          label="Delivered Orders"
          value={(stats?.deliveredOrders ?? 0).toString()}
          subValue={`of ${stats?.totalOrders ?? 0} total orders`}
        />
        <DashGradientCard
          icon={Wallet}
          label="Total Revenue"
          value={formatBDT(stats?.totalRevenue ?? 0)}
          subValue={`Avg ${formatBDT(stats?.avgOrderValue ?? 0)} / delivered order`}
        />
      </div>

      {/* Search */}
      <DashPanel className="p-4">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card px-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search by customer name or phone..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => { setQ(""); setPage(1) }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {totalItems} customer{totalItems !== 1 ? "s" : ""}
          {q && ` matched "${q}"`}
        </p>
      </DashPanel>

      {/* Customer grid */}
      {customers.length === 0 ? (
        <DashEmptyState
          icon={Package}
          title="No customers found"
          description={q ? "Try a different search term." : "Customers will appear here once orders are placed."}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customers.map((customer) => (
              <CustomerCard key={customer.phone} customer={customer} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
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
    </DashPage>
  )
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between border-b border-border/30 bg-muted/10 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">{customer.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {customer.phone}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <ShoppingBag className="h-3 w-3" />
          {customer.orderCount} order{customer.orderCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-2">{customer.address}{customer.district ? `, ${customer.district}` : ""}</span>
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/30 bg-muted/5 p-2.5 text-xs">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Wallet className="h-3 w-3" /> Total Spent
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">{formatBDT(customer.totalSpent)}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {customer.deliveredCount} delivered
            </p>
          </div>
          <div className="rounded-lg border border-border/30 bg-muted/5 p-2.5 text-xs">
            <p className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" /> Last Order
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatRelativeTime(customer.lastOrderAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
