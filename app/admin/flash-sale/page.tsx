"use client"

import { useEffect, useState } from "react"
import { createFlashSaleCampaign } from "@/src/api/flashSale/createFlashSaleCampaign"
import { getFlashSaleCampaigns } from "@/src/api/flashSale/getFlashSaleCampaigns"
import { updateFlashSaleCampaignTime } from "@/src/api/flashSale/updateFlashSaleCampaignTime"
import { updateFlashSaleCampaignProducts } from "@/src/api/flashSale/updateFlashSaleCampaignProducts"
import { deleteFlashSaleCampaign } from "@/src/api/flashSale/deleteFlashSaleCampaign"
import { useAdminStore } from "@/lib/admin-store"
import { notify } from "@/lib/notify"

export default function AdminFlashSalePage() {
  const { products } = useAdminStore()
  const [campaignId, setCampaignId] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [endsAt, setEndsAt] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFlashSaleCampaigns({ limit: 1 })
        const first = res?.data?.campaigns?.[0]
        if (first) {
          setCampaignId(first.id || "")
          setEndsAt(first.endAt?.slice(0, 16) || "")
          setSelected((first.products || []).map((p: { productId: string }) => p.productId))
        }
      } catch (error) {
        setSelected([])
        notify.error({ title: "Failed to load flash sale", message: getErrorMessage(error) })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const save = async () => {
    if (!endsAt) {
      notify.warning({ title: "End time required", message: "Please select end time." })
      return
    }

    const endDate = new Date(endsAt)
    if (Number.isNaN(endDate.getTime())) {
      notify.warning({ title: "Invalid date", message: "Please select a valid end date/time." })
      return
    }

    try {
      setSaving(true)
      if (campaignId) {
        if (selected.length === 0) {
          await deleteFlashSaleCampaign(campaignId)
          setCampaignId("")
          notify.success({ title: "Flash sale removed", message: "Campaign deleted successfully." })
          return
        }
        await updateFlashSaleCampaignTime(campaignId, {
          startAt: new Date().toISOString(),
          endAt: endDate.toISOString(),
        })
        await updateFlashSaleCampaignProducts(campaignId, {
          productIds: selected,
        })
        notify.success({ title: "Flash sale updated", message: "Campaign updated successfully." })
      } else {
        const createRes = await createFlashSaleCampaign({
          startAt: new Date().toISOString(),
          endAt: endDate.toISOString(),
          productIds: selected,
        })
        setCampaignId(createRes?.data?.id || "")
        notify.success({ title: "Flash sale created", message: "Campaign created successfully." })
      }
    } catch (error) {
      notify.error({ title: "Save failed", message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-6"><header><h1 className="text-2xl font-semibold text-foreground">Flash Sale</h1></header><div className="rounded-2xl border border-border/70 bg-card p-4"><div className="mb-3"><input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button onClick={() => void save()} disabled={saving || loading} className="ml-3 h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div><ul className="grid gap-2">{products.map((p) => <li key={p.id}><label className="text-sm"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected((prev) => prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id])} className="mr-2" />{p.name}</label></li>)}</ul></div></div>
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error
  }
  return "Please try again."
}
