"use client"

import { useMemo, useState } from "react"
import {
  Package,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Archive,
  Clock,
  RefreshCw,
  Pause,
  Truck,
  PackageCheck,
  Split,
  XOctagon,
  Ban,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts"
import { formatBDT, cx } from "@/lib/format"
import { useAdminStore } from "@/lib/admin-store"

const PIE_COLORS = ["#3B6CF4", "#8B7DF4", "#EC4899", "#10B981", "#F59E0B", "#06B6D4", "#F97316", "#8B5CF6"]
const WEEK_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const

export default function AdminOverview() {
  const { products, categories } = useAdminStore()

  const productRows = useMemo(
    () =>
      products.map((p) => {
        const price = Number(p.price || p.variants?.[0]?.price || 0)
        const categoryId = p.categorySlug || "other"
        const status = (p.status || "").toUpperCase()
        const stockCount = Number(p.stock || 0)
        return {
          id: p.id,
          status,
          price,
          createdAt: p.createdAt || "",
          categoryId,
          stockCount,
        }
      }),
    [products],
  )

  // ---- KPIs ----
  const totalRevenue = productRows.reduce((s, p) => s + (p.price || 0), 0)
  const totalStock = productRows.reduce((s, p) => s + p.stockCount, 0)
  const totalSold = productRows.length
  const remaining = Math.max(0, totalStock - totalSold)

  const normalizeStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending"
      case "PROCESSING":
        return "Processing"
      case "HOLD":
        return "Hold"
      case "PICKUP":
        return "Pickup"
      case "DELIVERED":
        return "Delivered"
      case "PARTIAL":
        return "Partial"
      case "REJECT":
        return "Rejected"
      case "CANCEL":
        return "Cancelled"
      case "NOT_COMPLETED":
        return "Incomplete"
      case "TRASH":
        return "Trash"
      default:
        return status
    }
  }

  const countByStatus = (status: string) =>
    productRows.filter((p) => normalizeStatus(p.status).toLowerCase() === status.toLowerCase()).length

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, tint: "text-[#3B6CF4]" },
    { label: "Total Sales", value: totalSold, icon: CheckCircle2, tint: "text-[#22C55E]" },
    { label: "Total Remaining", value: remaining, icon: Archive, tint: "text-[#F59E0B]" },
    { label: "Total Revenue", value: formatBDT(totalRevenue), icon: DollarSign, tint: "text-[#8B5CF6]" },
    { label: "Total Orders", value: productRows.length, icon: ShoppingBag, tint: "text-[#06B6D4]" },
    { label: "Pending", value: countByStatus("Pending"), icon: Clock, tint: "text-[#F59E0B]" },
    { label: "Processing", value: countByStatus("Processing"), icon: RefreshCw, tint: "text-[#3B6CF4]" },
    { label: "On Hold", value: countByStatus("Hold"), icon: Pause, tint: "text-slate-500" },
    { label: "Pickup", value: countByStatus("Pickup"), icon: Truck, tint: "text-[#EC4899]" },
    { label: "Delivered", value: countByStatus("Delivered"), icon: PackageCheck, tint: "text-[#22C55E]" },
    { label: "Partial", value: countByStatus("Partial"), icon: Split, tint: "text-[#10B981]" },
    { label: "Rejected", value: countByStatus("Rejected"), icon: XOctagon, tint: "text-[#FF3B3B]" },
    { label: "Cancelled", value: countByStatus("Cancelled"), icon: Ban, tint: "text-[#FF3B3B]" },
    { label: "Incomplete", value: countByStatus("Incomplete"), icon: AlertTriangle, tint: "text-[#F59E0B]" },
    { label: "Trash Orders", value: countByStatus("Trash"), icon: Trash2, tint: "text-slate-500" },
  ]

  // ---- Category pie data ----
  const categoryPie = useMemo(() => {
    const map: Record<string, number> = {}
    productRows.forEach((p) => {
      map[p.categoryId] = (map[p.categoryId] ?? 0) + 1
    })
    return Object.entries(map).map(([id, value]) => ({
      name: categories.find((c) => c.slug === id)?.name ?? id,
      value,
    }))
  }, [productRows, categories])

  // ---- Weekly sales trend ----
  const [weeklyMetric, setWeeklyMetric] = useState<"sales" | "revenue">("sales")
  const weeklyData = useMemo(() => {
    const buckets = WEEK_DAYS.reduce(
      (acc, day) => ({ ...acc, [day]: { day, sales: 0, revenue: 0 } }),
      {} as Record<(typeof WEEK_DAYS)[number], { day: string; sales: number; revenue: number }>,
    )

    productRows.forEach((p) => {
      if (!p.createdAt) return
      const d = new Date(p.createdAt)
      if (Number.isNaN(d.getTime())) return
      const day = WEEK_DAYS[d.getDay()] || "Sat"
      buckets[day].sales += 1
      buckets[day].revenue += p.price
    })

    return WEEK_DAYS.map((day) => buckets[day])
  }, [productRows])

  // ---- Catalog overview bar ----
  const catalogBars = useMemo(() => {
    return categories.map((c) => {
      const prods = productRows.filter((p) => p.categoryId === c.slug)
      const stock = prods.reduce((s, p) => s + p.stockCount, 0)
      const sold = prods.length
      return {
        name: c.name,
        stock,
        sales: sold,
        remaining: Math.max(0, stock - sold),
      }
    })
  }, [categories, productRows])

  // ---- Monthly trend (day-wise for selected month) ----
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const [selectedMonth, setSelectedMonth] = useState("Apr")
  const [monthlyMetric, setMonthlyMetric] = useState<"sales" | "revenue">("sales")
  const monthlyData = useMemo(() => {
    const monthIndex = months.indexOf(selectedMonth)
    const buckets = Array.from({ length: 31 }, (_, i) => ({ day: String(i + 1).padStart(2, "0"), sales: 0, revenue: 0 }))
    productRows.forEach((p) => {
      if (!p.createdAt) return
      const d = new Date(p.createdAt)
      if (Number.isNaN(d.getTime()) || d.getMonth() !== monthIndex) return
      const dayIdx = d.getDate() - 1
      if (!buckets[dayIdx]) return
      buckets[dayIdx].sales += 1
      buckets[dayIdx].revenue += p.price
    })
    return buckets.slice(0, 30).map((row, i) => {
      const day = String(i + 1).padStart(2, "0")
      return {
        day,
        sales: row.sales,
        revenue: row.revenue,
      }
    })
  }, [selectedMonth, productRows])

  // ---- Yearly trend ----
  const [yearlyMetric, setYearlyMetric] = useState<"sales" | "revenue">("revenue")
  const yearlyData = useMemo(() => {
    const buckets = months.map((m) => ({ month: m, sales: 0, revenue: 0 }))
    productRows.forEach((p) => {
      if (!p.createdAt) return
      const d = new Date(p.createdAt)
      if (Number.isNaN(d.getTime())) return
      const monthIdx = d.getMonth()
      buckets[monthIdx].sales += 1
      buckets[monthIdx].revenue += p.price
    })
    return buckets
  }, [productRows])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin Panel
        </p>
        <h1 className="mt-0.5 text-xl font-bold text-foreground md:text-2xl">Overview</h1>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="rounded-[10px] border border-border/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className={cx("h-4 w-4", tint)} />
              <span className="truncate">{label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground md:text-2xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Catalog pie */}
      <section className="rounded-[10px] border border-border/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-foreground">Catalog-wise Sales</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name} ${value}`}
              >
                {categoryPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Weekly trend */}
      <section className="rounded-[10px] border border-border/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Weekly Sales Trend</h2>
          <select
            value={weeklyMetric}
            onChange={(e) => setWeeklyMetric(e.target.value as "sales" | "revenue")}
            className="rounded-md border border-[#3B6CF4] bg-white px-3 py-1.5 text-xs font-semibold text-[#3B6CF4] outline-none"
          >
            <option value="sales">Sales</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => (weeklyMetric === "revenue" ? formatBDT(v as number) : v)} />
              <Line
                type="monotone"
                dataKey={weeklyMetric}
                stroke="#3B6CF4"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#3B6CF4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Catalog bar chart */}
      <section className="rounded-[10px] border border-border/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="mb-4 text-sm font-bold text-foreground">Catalog Overview</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catalogBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly trend */}
      <section className="rounded-[10px] border border-border/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">Monthly Sales Trend</h2>
          <div className="flex gap-2">
            <select
              value={monthlyMetric}
              onChange={(e) => setMonthlyMetric(e.target.value as "sales" | "revenue")}
              className="rounded-md border border-[#3B6CF4] bg-white px-3 py-1.5 text-xs font-semibold text-[#3B6CF4] outline-none"
            >
              <option value="sales">Sales</option>
              <option value="revenue">Revenue</option>
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border border-[#3B6CF4] bg-white px-3 py-1.5 text-xs font-semibold text-[#3B6CF4] outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => (monthlyMetric === "revenue" ? formatBDT(v as number) : v)} />
              <Line
                type="monotone"
                dataKey={monthlyMetric}
                stroke="#8B7DF4"
                strokeWidth={2}
                dot={{ r: 3, fill: "#8B7DF4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Yearly trend */}
      <section className="rounded-[10px] border border-border/70 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Yearly Sales Trend</h2>
          <select
            value={yearlyMetric}
            onChange={(e) => setYearlyMetric(e.target.value as "sales" | "revenue")}
            className="rounded-md border border-[#3B6CF4] bg-white px-3 py-1.5 text-xs font-semibold text-[#3B6CF4] outline-none"
          >
            <option value="sales">Sales</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => (yearlyMetric === "revenue" ? formatBDT(v as number) : v)} />
              <Line
                type="monotone"
                dataKey={yearlyMetric}
                stroke="#3B6CF4"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#3B6CF4", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
