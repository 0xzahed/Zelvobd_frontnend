"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"

export default function AdminSubCategoriesPage() {
  const { categories } = useAdminStore()
  const [search, setSearch] = useState("")
  const rows = useMemo(() => categories.flatMap((c) => c.subCategories.map((s) => ({ id: s.id, name: s.name, parent: c.name }))).filter((r) => r.name.toLowerCase().includes(search.toLowerCase())), [categories, search])

  return <div className="space-y-4"><div className="rounded-2xl border border-border/60 bg-card p-4"><div className="relative w-full md:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sub-category..." className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" /></div><ul className="mt-4 space-y-2">{rows.map((r) => <li key={r.id} className="text-sm">{r.name} <span className="text-muted-foreground">({r.parent})</span></li>)}</ul></div></div>
}
