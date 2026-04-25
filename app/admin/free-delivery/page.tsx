"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Search, Truck } from "lucide-react"
import { formatBDT } from "@/lib/format"
import { useAdminStore } from "@/lib/admin-store"
import { notify } from "@/lib/notify"

export default function AdminFreeDeliveryPage() {
  const { products, categories, updateProduct } = useAdminStore()
  const [category, setCategory] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  useEffect(() => { const init: Record<string, boolean> = {}; for (const p of products) if (p.isFreeDelivery) init[p.id] = true; setSelected(init) }, [products])
  const filtered = useMemo(() => products.filter((p) => (category === "all" || p.categorySlug === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()))), [products, category, query])
  const onSubmit = () => { for (const p of products) updateProduct(p.id, { isFreeDelivery: !!selected[p.id] }); notify.success({ title: "Free Delivery updated", message: "Saved." }) }

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug
  return <div className="space-y-4"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-[#3B6CF4]" /><h2 className="text-base text-foreground">Free Delivery Products</h2></div><div className="rounded-2xl border border-border/60 bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-full border border-[#3B6CF4]/40 bg-[#EEF4FF] px-4 text-sm"><option value="all">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><button onClick={onSubmit} className="h-10 rounded-md bg-[#3B6CF4] px-5 text-sm text-white">Submit</button></div><div className="relative w-full md:w-[280px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" /></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-3">Select</th><th className="px-3 py-3">Title</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Category</th></tr></thead><tbody>{filtered.map((p)=><tr key={p.id} className="border-b"><td className="px-3 py-3"><input type="checkbox" checked={!!selected[p.id]} onChange={() => setSelected((prev)=>({ ...prev, [p.id]: !prev[p.id] }))} /></td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden rounded-md"><Image src={p.images?.[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" /></div>{p.name}</div></td><td className="px-3 py-3">{formatBDT(p.price)}</td><td className="px-3 py-3">{catName(p.categorySlug)}</td></tr>)}</tbody></table></div></div></div>
}
