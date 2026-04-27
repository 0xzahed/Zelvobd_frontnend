"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Search, Truck } from "lucide-react"
import { formatBDT } from "@/lib/format"
import { useAdminStore } from "@/lib/admin-store"
import { notify } from "@/lib/notify"
import { getFreeDeliveryAdmin } from "@/src/api/freeDelivery/getFreeDeliveryAdmin"
import { updateFreeDeliveryProducts } from "@/src/api/freeDelivery/updateFreeDeliveryProducts"

export default function AdminFreeDeliveryPage() {
  const { products, categories, resetAll } = useAdminStore()
  const [category, setCategory] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [initialSelected, setInitialSelected] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFreeDeliveryAdmin()
        const selectedProductIds =
          res?.data?.sources?.products?.map((row: { productId: string }) => row.productId) || []
        const nextSelected: Record<string, boolean> = {}
        for (const id of selectedProductIds) nextSelected[id] = true
        setSelected(nextSelected)
        setInitialSelected(nextSelected)
      } catch (error) {
        notify.error({ title: "Failed to load free delivery", message: getErrorMessage(error) })
      }
    }
    void load()
  }, [])

  const filtered = useMemo(() => products.filter((p) => (category === "all" || p.categorySlug === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()))), [products, category, query])
  const onSubmit = async () => {
    const addProductIds = Object.keys(selected).filter((id) => selected[id] && !initialSelected[id])
    const removeProductIds = Object.keys(initialSelected).filter((id) => initialSelected[id] && !selected[id])

    if (addProductIds.length === 0 && removeProductIds.length === 0) {
      notify.info({ title: "No changes", message: "Nothing to update." })
      return
    }

    try {
      setSaving(true)
      await updateFreeDeliveryProducts({
        ...(addProductIds.length > 0 ? { addProductIds } : {}),
        ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
      })
      setInitialSelected(selected)
      resetAll()
      notify.success({ title: "Free Delivery updated", message: "Saved." })
    } catch (error) {
      notify.error({ title: "Update failed", message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug
  return <div className="space-y-4"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-[#306FD7]" /><h2 className="text-base text-foreground">Free Delivery Products</h2></div><div className="rounded-2xl border border-border/60 bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-full border border-[#306FD7]/40 bg-[#EEF4FF] px-4 text-sm"><option value="all">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><button onClick={() => void onSubmit()} disabled={saving} className="h-10 rounded-md bg-[#306FD7] px-5 text-sm text-white disabled:opacity-60">{saving ? "Saving..." : "Submit"}</button></div><div className="relative w-full md:w-70"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" /></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-175 text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="px-3 py-3">Select</th><th className="px-3 py-3">Title</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Category</th></tr></thead><tbody>{filtered.map((p)=><tr key={p.id} className="border-b"><td className="px-3 py-3"><input type="checkbox" checked={!!selected[p.id]} onChange={() => setSelected((prev)=>({ ...prev, [p.id]: !prev[p.id] }))} /></td><td className="px-3 py-3"><div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden rounded-md"><Image src={p.images?.[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" /></div>{p.name}</div></td><td className="px-3 py-3">{formatBDT(p.price)}</td><td className="px-3 py-3">{catName(p.categorySlug)}</td></tr>)}</tbody></table></div></div></div>
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error
  }
  return "Please try again."
}
