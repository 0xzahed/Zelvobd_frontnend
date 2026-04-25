"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"

export default function TrendingProductsPage() {
  const { products, categories } = useAdminStore()
  const [category, setCategory] = useState<string>(categories[0]?.slug ?? "")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => products.filter((p) => (!category || p.categorySlug === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()))), [products, category, query])

  return <div className="space-y-4"><h2 className="text-base text-foreground">Trending Products</h2><div className="rounded-2xl border border-border/60 bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-full border border-[#3B6CF4]/40 bg-[#EEF4FF] px-4 text-sm">{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><div className="relative w-full md:w-[280px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" /></div></div><div className="mt-4 space-y-2">{filtered.map((p) => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!selected[p.id]} onChange={() => setSelected((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} />{p.name}</label>)}</div></div></div>
}
