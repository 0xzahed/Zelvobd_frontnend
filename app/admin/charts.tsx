"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts"
import Link from "next/link"
import { DashPanel, DashSectionTitle } from "@/dashboard/components/dash-ui"

type WeeklyData = { day: string; sales: number; orders: number }[]
type StatusData = { name: string; value: number; color: string }[]
type PieData = { name: string; value: number; color: string }[]

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  fontSize: 13,
}

export function WeeklySalesChart({ data }: { data: WeeklyData }) {
  return (
    <DashPanel>
      <DashSectionTitle title="Weekly Sales" />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={tooltipStyle} />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#306fd7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashPanel>
  )
}

export function BestSellingPie({ data }: { data: PieData }) {
  if (data.length === 0) {
    return (
      <DashPanel>
        <DashSectionTitle title="Best Selling Products" />
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No products yet</div>
      </DashPanel>
    )
  }
  return (
    <DashPanel>
      <DashSectionTitle title="Best Selling Products" />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#8884d8" label={({ name }) => name}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashPanel>
  )
}

export function OrderStatusChart({ data }: { data: StatusData }) {
  return (
    <DashPanel className="lg:col-span-2">
      <DashSectionTitle
        title="Order Status Distribution"
        action={
          <Link href="/admin/orders/pending" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        }
      />
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No orders yet</div>
      ) : (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#F3F4F6" }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashPanel>
  )
}
