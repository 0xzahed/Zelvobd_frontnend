"use client"

import { useMemo, useState } from "react"
import { Search, Truck, ShoppingCart } from "lucide-react"

type OrderStatus = "New" | "Pending" | "Processing" | "Hold" | "Pickup" | "Delivered" | "Customer Cancelled" | "Cancelled" | "Trash"
type Order = { id: string; invoiceNo: number; customer: string; address: string; mobile: string; extraWhatsapp?: string; date: string; consignmentId?: string; status: string }
type Props = { title: string; status: OrderStatus; showSteadfast?: boolean }
const STATUS_FILTERS = ["Pending", "Processing", "Delivered", "Cancelled", "All"] as const

export function OrderList({ title, status, showSteadfast = false }: Props) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("Pending")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const sourceOrders: Order[] = []

  const orders = useMemo(() => {
    const filtered = sourceOrders.filter((o) => o.status === status)
    const q = query.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter((o) => o.customer.toLowerCase().includes(q) || o.mobile.toLowerCase().includes(q) || String(o.invoiceNo).includes(q))
  }, [status, query, sourceOrders])

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id))
  const toggleAll = () => { if (allSelected) setSelected(new Set()); else setSelected(new Set(orders.map((o) => o.id))) }
  const toggleOne = (id: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })

  return <div className="space-y-4"><h1 className="text-lg text-foreground">{title}</h1><div className="rounded-lg border border-border bg-card"><div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap items-center gap-3"><span className="text-sm text-muted-foreground">Order List</span><select value={filter} onChange={(e) => setFilter(e.target.value as (typeof STATUS_FILTERS)[number])} className="h-9 rounded-md border border-primary/40 bg-white px-3 text-sm text-foreground outline-none">{STATUS_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}</select>{showSteadfast && <button type="button" className="inline-flex h-9 items-center gap-2 rounded-md bg-secondary px-3 text-sm text-primary transition hover:bg-secondary/70"><Truck className="h-4 w-4" />Steadfast</button>}</div><div className="relative w-full md:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name / Number / Invoice No" className="h-10 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-primary" /></div></div>{orders.length===0?<div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center"><ShoppingCart className="h-20 w-20 text-muted-foreground/40" strokeWidth={1.25} /><p className="mt-2 text-base text-foreground">No orders found</p><p className="text-xs text-muted-foreground">There are no orders in this status at the moment.</p></div>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-t border-border text-xs text-muted-foreground"><th className="px-5 py-3 text-left"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" /></th></tr></thead><tbody>{orders.map((o)=><tr key={o.id}><td className="px-5 py-4 align-top"><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="h-4 w-4 accent-primary" /></td></tr>)}</tbody></table></div>}</div></div>
}
