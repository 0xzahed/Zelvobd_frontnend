"use client"

import { useEffect, useState } from "react"
import { createFlashSaleCampaign } from "@/src/api/flashSale/createFlashSaleCampaign"
import { getFlashSaleCampaigns } from "@/src/api/flashSale/getFlashSaleCampaigns"
import { useAdminStore } from "@/lib/admin-store"

export default function AdminFlashSalePage() {
  const { products } = useAdminStore()
  const [selected, setSelected] = useState<string[]>([])
  const [endsAt, setEndsAt] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFlashSaleCampaigns({ limit: 1 })
        const first = res?.data?.campaigns?.[0]
        if (first) {
          setEndsAt(first.endAt?.slice(0, 16) || "")
          setSelected((first.products || []).map((p: { productId: string }) => p.productId))
        }
      } catch {
        setSelected([])
      }
    }
    void load()
  }, [])

  const save = async () => {
    await createFlashSaleCampaign({ startAt: new Date().toISOString(), endAt: new Date(endsAt).toISOString(), productIds: selected })
  }

  return <div className="space-y-6"><header><h1 className="text-2xl font-semibold text-foreground">Flash Sale</h1></header><div className="rounded-2xl border border-border/70 bg-card p-4"><div className="mb-3"><input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button onClick={save} className="ml-3 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Save</button></div><ul className="grid gap-2">{products.map((p) => <li key={p.id}><label className="text-sm"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])} className="mr-2" />{p.name}</label></li>)}</ul></div></div>
}
