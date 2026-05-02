"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, Clock3, ImagePlus, Search, Tag } from "lucide-react"
import { createFlashSaleCampaign } from "@/src/api/flashSale/createFlashSaleCampaign"
import { getFlashSaleCampaigns } from "@/src/api/flashSale/getFlashSaleCampaigns"
import { updateFlashSaleCampaignTime } from "@/src/api/flashSale/updateFlashSaleCampaignTime"
import { updateFlashSaleCampaignProducts } from "@/src/api/flashSale/updateFlashSaleCampaignProducts"
import { deleteFlashSaleCampaign } from "@/src/api/flashSale/deleteFlashSaleCampaign"
import { useAdminStore } from "@/lib/admin-store"
import { notify } from "@/lib/notify"

const FLASH_SALE_BG_STORAGE_KEY = "flash-sale-bg-image"

export default function AdminFlashSalePage() {
  const { products } = useAdminStore()
  const [campaignId, setCampaignId] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [initialSelected, setInitialSelected] = useState<string[]>([])
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [backgroundImage, setBackgroundImage] = useState("")
  const [query, setQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const bgFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFlashSaleCampaigns({ limit: 1 })
        const first = res?.data?.campaigns?.[0]
        if (first) {
          const selectedProductIds = (first.products || []).map((p: { productId: string }) => p.productId)
          setCampaignId(first.id || "")
          setStartsAt(first.startAt?.slice(0, 16) || "")
          setEndsAt(first.endAt?.slice(0, 16) || "")
          setSelected(selectedProductIds)
          setInitialSelected(selectedProductIds)
          setBackgroundImage(first.bgImage || first.backgroundImage || "")
        }
      } catch (error) {
        setSelected([])
        notify.error({ title: "Failed to load flash sale", message: getErrorMessage(error) })
      } finally {
        const storedBg = localStorage.getItem(FLASH_SALE_BG_STORAGE_KEY)
        if (storedBg) setBackgroundImage(storedBg)
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filteredProducts = useMemo(() => {
    const lc = query.toLowerCase().trim()
    if (!lc) return products
    return products.filter((p) => p.name.toLowerCase().includes(lc))
  }, [products, query])
  const statusLabel = campaignId ? "SCHEDULED" : "DRAFT"

  const toggleProduct = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleBackgroundPick = (file: File | null | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const next = String(reader.result || "")
      setBackgroundImage(next)
    }
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!startsAt) {
      notify.warning({ title: "Start time required", message: "Please select start time." })
      return
    }

    if (!endsAt) {
      notify.warning({ title: "End time required", message: "Please select end time." })
      return
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      notify.warning({ title: "Invalid date", message: "Please select valid start/end date-time." })
      return
    }

    if (endDate <= startDate) {
      notify.warning({ title: "Invalid range", message: "End time must be after start time." })
      return
    }

    try {
      setSaving(true)
      localStorage.setItem(FLASH_SALE_BG_STORAGE_KEY, backgroundImage.trim())
      if (campaignId) {
        if (selected.length === 0) {
          await deleteFlashSaleCampaign(campaignId)
          setCampaignId("")
          notify.success({ title: "Flash sale removed", message: "Campaign deleted successfully." })
          return
        }
        await updateFlashSaleCampaignTime(campaignId, {
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
        })

        const initialSet = new Set(initialSelected)
        const selectedSet = new Set(selected)
        const addProductIds = selected.filter((id) => !initialSet.has(id))
        const removeProductIds = initialSelected.filter((id) => !selectedSet.has(id))

        if (addProductIds.length > 0 || removeProductIds.length > 0) {
          await updateFlashSaleCampaignProducts(campaignId, {
            ...(addProductIds.length > 0 ? { addProductIds } : {}),
            ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
          })
        }

        setInitialSelected(selected)
        notify.success({ title: "Flash sale updated", message: "Campaign updated successfully." })
      } else {
        const createRes = await createFlashSaleCampaign({
          title: "Flash Sale Campaign",
          startAt: startDate.toISOString(),
          endAt: endDate.toISOString(),
          discountType: "PERCENT",
          discountValue: 10,
          productIds: selected,
        })
        setCampaignId(createRes?.data?.id || "")
        setInitialSelected(selected)
        notify.success({ title: "Flash sale created", message: "Campaign created successfully." })
      }
    } catch (error) {
      notify.error({ title: "Save failed", message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 bg-slate-50/40 p-3 md:p-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-4xl font-black lowercase tracking-tight text-slate-900">upcomming</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{statusLabel}</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">10% OFF</span>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Campaign Details</h2>
        <div className="my-4 h-px bg-slate-200" />

        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-4 w-4" /> Start Time
            </span>
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Clock3 className="h-4 w-4" /> End Time
            </span>
            <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </label>

          <div className="block">
            <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Tag className="h-4 w-4" /> Total Products
            </span>
            <div className="flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900">
              {selected.length}
            </div>
          </div>
        </div>

        <button
          onClick={() => void save()}
          disabled={saving || loading}
          className="mt-4 h-12 w-full rounded-2xl bg-slate-200 text-base font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Edit Time"}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manage Products</h2>
            <p className="text-sm text-slate-500">Add or remove products from this campaign.</p>
          </div>
          <button
            onClick={() => void save()}
            disabled={saving || loading}
            className="h-11 rounded-2xl bg-blue-400 px-6 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Products"}
          </button>
        </div>
        <div className="my-4 h-px bg-slate-200" />

        <p className="mb-3 text-sm font-semibold text-foreground">Background image (optional)</p>

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={() => bgFileInputRef.current?.click()}
            className="grid h-20 w-full place-items-center rounded-2xl border border-border bg-secondary text-center md:w-31.5"
          >
            <div>
              <ImagePlus className="mx-auto mb-1 h-5 w-5 text-primary" />
              <p className="text-xs text-muted-foreground">Upload / paste URL below</p>
            </div>
          </button>

          <div className="flex-1">
            {backgroundImage ? (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-border bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={backgroundImage}
                  alt="Flash sale background preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-28 w-full place-items-center rounded-xl border border-dashed border-border bg-secondary text-xs text-muted-foreground">
                No image selected
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended size: 1600 x 500 px (JPG/PNG/WebP). Shown behind Flash Sale on home page.
            </p>
          </div>
        </div>

        <input
          ref={bgFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleBackgroundPick(e.target.files?.[0])}
        />

        <p className="mt-3 text-sm text-slate-500">{filteredProducts.length} Products Found</p>
        <div className="mb-3 mt-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Select products</h2>
          <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-52 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
          {filteredProducts.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
            >
              <span className="line-clamp-1 text-sm text-foreground">{p.name}</span>
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
          {filteredProducts.length === 0 && (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No products found.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error
  }
  return "Please try again."
}
