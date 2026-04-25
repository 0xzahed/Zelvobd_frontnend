"use client"

import { useState } from "react"
import { Search } from "lucide-react"

type Customer = { id: string; name: string; address: string; mobile: string; totalOrders: number }

export default function CustomersPage() {
  const [customers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const filtered = customers.filter((c) => [c.name, c.address, c.mobile].join(" ").toLowerCase().includes(search.toLowerCase()))

  return <div className="space-y-5"><h1 className="text-xl text-foreground">Customers</h1><div className="overflow-hidden rounded-lg bg-card shadow-card"><div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between"><div className="text-base text-foreground">Customer List</div><div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none" /></div></div><div className="p-10 text-center text-sm text-muted-foreground">No customer API connected yet.</div></div></div>
}
