"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Ban,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProducts } from "@/src/hooks/api/useProducts"
import { useOrders, type Order } from "@/src/hooks/api/useOrders"
import { formatBDT, formatRelativeTime } from "@/lib/format"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  PROCESSING: "#3B82F6",
  HOLD: "#8B5CF6",
  PICKUP: "#06B6D4",
  DELIVERED: "#10B981",
  CUSTOMER_CANCELLED: "#EF4444",
  CANCELLED: "#6B7280",
  TRASH: "#1F2937",
}

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

export default function AdminOverview() {
  const { admin } = useAuth()

  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 1000 })
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 1000 })

  const products = (productsData as any)?.products || productsData || []
  const ordersMeta = (ordersData as any)?.meta
  const orders = (ordersData as any)?.orders || []

  const stats = useMemo(() => {
    const totalProducts = Array.isArray(products) ? products.length : 0
    const totalOrders = ordersMeta?.total || orders.length
    const totalRevenue = (orders as Order[]).reduce((sum, o) => sum + (o.total || 0), 0)
    const pendingOrders = (orders as Order[]).filter((o) => o.status === "PENDING").length
    const deliveredOrders = (orders as Order[]).filter((o) => o.status === "DELIVERED").length
    const cancelledOrders = (orders as Order[]).filter(
      (o) => o.status === "CANCELLED" || o.status === "CUSTOMER_CANCELLED"
    ).length

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
    }
  }, [products, orders, ordersMeta])

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      HOLD: 0,
      PICKUP: 0,
      DELIVERED: 0,
      CUSTOMER_CANCELLED: 0,
      CANCELLED: 0,
      TRASH: 0,
    }
    ;(orders as Order[]).forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || "#6B7280",
      }))
  }, [orders])

  const recentOrders = useMemo(() => {
    return [...(orders as Order[])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [orders])

  const lowStockProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((p: any) => p.stock === false || p.availability === false).slice(0, 5)
  }, [products])

  const isLoading = productsLoading || ordersLoading

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    href,
  }: {
    label: string
    value: string | number
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
    color: string
    href?: string
  }) => (
    <Link
      href={href || "#"}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className="grid h-10 w-10 place-items-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </Link>
  )

  return (
    <div className="admin-page space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          Welcome back, {admin?.email?.split("@")[0] || "Admin"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is what is happening with your store today.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          Loading dashboard data...
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="#3B82F6"
          href="/admin/products"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="#8B5CF6"
          href="/admin/orders/new"
        />
        <StatCard
          label="Total Revenue"
          value={formatBDT(stats.totalRevenue)}
          icon={TrendingUp}
          color="#10B981"
          href="/admin/orders/delivered"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="#F59E0B"
          href="/admin/orders/pending"
        />
      </div>

      {/* Middle Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Order Status Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Order Status Overview</h2>
            <Link href="/admin/orders/new" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          {statusChartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No orders yet
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Delivered</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{stats.cancelledOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm text-muted-foreground">Pickup</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {(orders as Order[]).filter((o) => o.status === "PICKUP").length}
                </span>
              </div>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Low Stock Alert
                </h3>
              </div>
              <ul className="space-y-1">
                {lowStockProducts.map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between text-xs">
                    <span className="truncate text-foreground">{p.name}</span>
                    <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Out of stock
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders/new" className="text-xs text-primary hover:underline">
            View all orders
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/40 transition hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">#{order.code}</td>
                    <td className="px-5 py-3 text-foreground">{order.customerName}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {formatBDT(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${STATUS_COLORS[order.status]}15`,
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatRelativeTime(order.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

