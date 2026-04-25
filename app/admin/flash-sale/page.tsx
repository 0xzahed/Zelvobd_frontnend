"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ImagePlus, Search } from "lucide-react"
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
      localStorage.setItem(FLASH_SALE_BG_STORAGE_KEY, backgroundImage.trim())
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
          startAt: new Date().toISOString(),
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
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Flash Sale</h1>
          <p className="text-sm text-muted-foreground">
            Pick featured products and set the countdown end time.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ends at
            </span>
            <div className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4">
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-[210px] bg-transparent text-sm outline-none"
              />
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
          </label>

          <button
            onClick={() => void save()}
            disabled={saving || loading}
            className="h-11 rounded-full bg-[#3B6CF4] px-7 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Background image (optional)</p>

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={() => bgFileInputRef.current?.click()}
            className="grid h-20 w-full place-items-center rounded-2xl border border-border bg-[#EEF3FF] text-center md:w-[126px]"
          >
            <div>
              <ImagePlus className="mx-auto mb-1 h-5 w-5 text-[#3B6CF4]" />
              <p className="text-xs text-muted-foreground">Upload / paste URL below</p>
            </div>
          </button>

          <div className="flex-1">
            {backgroundImage ? (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-border bg-[#EEF0F7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={backgroundImage}
                  alt="Flash sale background preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-28 w-full place-items-center rounded-xl border border-dashed border-border bg-[#EEF0F7] text-xs text-muted-foreground">
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

        <p className="mt-3 text-sm text-muted-foreground">{selected.length} products selected</p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
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

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
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
                className="h-4 w-4 accent-[#3B6CF4]"
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
