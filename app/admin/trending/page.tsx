"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import { getTopCatalog } from "@/src/api/topCatalog/getTopCatalog"
import { replaceTopCatalogCategories } from "@/src/api/topCatalog/replaceTopCatalogCategories"
import { notify } from "@/lib/notify"
import { useEffect } from "react"

export default function TrendingProductsPage() {
  const { products, categories } = useAdminStore()
  const [category, setCategory] = useState<string>(categories[0]?.slug ?? "")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTopCatalog({ page: 1, limit: 1 })
        const activeCategoryIds = new Set(
          (res?.data?.categories || []).map((row: { id: string }) => row.id),
        )
        const nextSelected: Record<string, boolean> = {}
        for (const product of products) {
          const categoryId = categories.find((c) => c.slug === product.categorySlug)?.id
          if (categoryId && activeCategoryIds.has(categoryId)) {
            nextSelected[product.id] = true
          }
        }
        setSelected(nextSelected)
      } catch (error) {
        notify.error({ title: "Failed to load trending", message: getErrorMessage(error) })
      }
    }
    if (products.length > 0 && categories.length > 0) {
      void load()
    }
  }, [products, categories])

  const filtered = useMemo(() => products.filter((p) => (!category || p.categorySlug === category) && (!query || p.name.toLowerCase().includes(query.toLowerCase()))), [products, category, query])

  const onSubmit = async () => {
    const selectedCategoryIds = Array.from(
      new Set(
        filtered
          .filter((product) => selected[product.id])
          .map((product) => categories.find((c) => c.slug === product.categorySlug)?.id)
          .filter(Boolean),
      ),
    ) as string[]

    try {
      setSaving(true)
      await replaceTopCatalogCategories({ categoryIds: selectedCategoryIds })
      notify.success({ title: "Trending updated", message: "Top catalog saved successfully." })
    } catch (error) {
      notify.error({ title: "Update failed", message: getErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-4"><h2 className="text-base text-foreground">Trending Products</h2><div className="rounded-2xl border border-border/60 bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-full border border-[#3B6CF4]/40 bg-[#EEF4FF] px-4 text-sm">{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><button onClick={() => void onSubmit()} disabled={saving} className="h-10 rounded-md bg-[#3B6CF4] px-5 text-sm text-white disabled:opacity-60">{saving ? "Saving..." : "Submit"}</button></div><div className="relative w-full md:w-[280px]"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product" className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm outline-none" /></div></div><div className="mt-4 space-y-2">{filtered.map((p) => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!selected[p.id]} onChange={() => setSelected((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} />{p.name}</label>)}</div></div></div>
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const maybe = error as { message?: unknown; error?: unknown }
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error
  }
  return "Please try again."
}
