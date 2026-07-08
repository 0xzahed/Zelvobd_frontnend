"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, Clock, CheckSquare, Loader2, Search, Tag } from "lucide-react"
import { format } from "date-fns"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { Badge } from "@/components/ui/badge"
import { useFlashSaleDetails, useUpdateFlashSaleTime, useUpdateFlashSaleProducts } from "@/src/hooks/api/useFlashSales"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { useProducts } from "@/src/hooks/api/useProducts"

export default function DashboardFlashSaleDetailsPage() {
  const { id } = useParams() as { id: string }
  const { data: campaign, isLoading: isCampaignLoading } = useFlashSaleDetails(id)
  const updateTimeMutation = useUpdateFlashSaleTime()
  const updateProductsMutation = useUpdateFlashSaleProducts()

  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [timeForm, setTimeForm] = useState({ startAt: "", endAt: "" })
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [stagedProductIds, setStagedProductIds] = useState<Set<string>>(new Set())

  const { data: categories = [] } = useCategories()
  const { data: subCategories = [], isLoading: isSubCategoriesLoading } = useSubCategories(selectedCategory, {
    enabled: !!selectedCategory && selectedCategory !== "all",
  })
  const { data: availableProducts = [], isLoading: isProductsLoading } = useProducts({
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    subCategoryId: selectedSubCategory !== "all" ? selectedSubCategory : undefined,
    search: searchQuery,
    limit: 100,
  })

  useEffect(() => {
    if (campaign?.products) {
      setStagedProductIds(new Set(campaign.products.map((p) => p.productId)))
    }
  }, [campaign?.products])

  const handleOpenTimeModal = () => {
    if (campaign) {
      setTimeForm({
        startAt: new Date(campaign.startAt).toISOString().slice(0, 16),
        endAt: new Date(campaign.endAt).toISOString().slice(0, 16),
      })
      setTimeModalOpen(true)
    }
  }

  const handleTimeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!timeForm.startAt || !timeForm.endAt) return
    await updateTimeMutation.mutateAsync({
      id,
      payload: {
        startAt: new Date(timeForm.startAt).toISOString(),
        endAt: new Date(timeForm.endAt).toISOString(),
      },
    })
    setTimeModalOpen(false)
  }

  const handleToggleProduct = (productId: string) => {
    const next = new Set(stagedProductIds)
    if (next.has(productId)) next.delete(productId)
    else next.add(productId)
    setStagedProductIds(next)
  }

  const handleSelectAll = () => {
    const next = new Set(stagedProductIds)
    let added = 0
    availableProducts.forEach((p: any) => {
      if (!next.has(p.id)) {
        next.add(p.id)
        added++
      }
    })
    if (added === 0) availableProducts.forEach((p: any) => next.delete(p.id))
    setStagedProductIds(next)
  }

  const handleSaveProducts = async () => {
    if (!campaign) return
    const initialSet = new Set(campaign.products.map((p) => p.productId))
    const addProductIds = Array.from(stagedProductIds).filter((pid) => !initialSet.has(pid))
    const removeProductIds = Array.from(initialSet).filter((pid) => !stagedProductIds.has(pid))
    if (addProductIds.length === 0 && removeProductIds.length === 0) return
    await updateProductsMutation.mutateAsync({
      id,
      payload: {
        ...(addProductIds.length > 0 ? { addProductIds } : {}),
        ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
      },
    })
  }

  const hasChanges = useMemo(() => {
    if (!campaign) return false
    const initialSet = new Set(campaign.products.map((p) => p.productId))
    if (initialSet.size !== stagedProductIds.size) return true
    for (const pid of stagedProductIds) if (!initialSet.has(pid)) return true
    return false
  }, [campaign, stagedProductIds])

  if (isCampaignLoading) return <DashPage><DashLoading label="Loading campaign..." /></DashPage>
  if (!campaign) return <DashPage><DashHeader title="Campaign not found" /><DashPanel><p className="py-16 text-center text-muted-foreground">Campaign not found.</p></DashPanel></DashPage>

  return (
    <DashPage>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/flash-sale" className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{campaign.title}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={campaign.status === "ACTIVE" ? "default" : campaign.status === "SCHEDULED" ? "secondary" : "outline"}>
              {campaign.status}
            </Badge>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
              {campaign.discountType === "PERCENT" ? `${campaign.discountValue}% OFF` : `৳${campaign.discountValue} OFF`}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Campaign Info */}
        <DashPanel className="h-fit p-5">
          <h3 className="mb-4 border-b border-border/40 pb-3 text-sm font-bold text-foreground">Campaign Details</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Start Time</p>
                <p className="font-medium text-foreground">{format(new Date(campaign.startAt), "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">End Time</p>
                <p className="font-medium text-foreground">{format(new Date(campaign.endAt), "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="font-medium text-foreground">{campaign.productCount}</p>
              </div>
            </div>
            {campaign.bannerUrl && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Banner Image</p>
                <img
                  src={campaign.bannerUrl}
                  alt="Banner"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: 120 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleOpenTimeModal}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border/60 bg-card text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Edit Time
          </button>
        </DashPanel>

        {/* Product Management */}
        <DashPanel className="p-5 md:col-span-2">
          <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Manage Products</h3>
              <p className="text-xs text-muted-foreground">Add or remove products from this campaign</p>
            </div>
            <button
              onClick={handleSaveProducts}
              disabled={!hasChanges || updateProductsMutation.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {updateProductsMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory("") }}
              className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
            >
              <option value="">All Categories</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory || isSubCategoriesLoading}
              className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40 disabled:opacity-50"
            >
              <option value="">All Subcategories</option>
              {subCategories.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-card px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{availableProducts.length} products found</p>
            {availableProducts.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-secondary"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Toggle All
              </button>
            )}
          </div>

          {isProductsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/40 text-sm text-muted-foreground">
              No products found matching filters.
            </div>
          ) : (
            <div className="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((p: any) => {
                const isSelected = stagedProductIds.has(p.id)
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors hover:bg-secondary/30 ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/40 bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">ID: {p.id.slice(-6)}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProduct(p.id)}
                        className="h-4 w-4 shrink-0 accent-primary"
                      />
                    </div>
                    {isSelected && (
                      <span className="w-fit rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        FLASH SALE
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        </DashPanel>
      </div>

      {/* Edit Time Modal */}
      {timeModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setTimeModalOpen(false)}>
          <form onSubmit={handleTimeUpdate} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="relative mb-6 border-b border-border/40 pb-3 text-center">
              <h3 className="text-base font-bold text-foreground">Edit Campaign Time</h3>
              <button type="button" aria-label="Close" onClick={() => setTimeModalOpen(false)} className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <span className="text-lg">&times;</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={timeForm.startAt}
                    onChange={(e) => setTimeForm({ ...timeForm, startAt: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={timeForm.endAt}
                    onChange={(e) => setTimeForm({ ...timeForm, endAt: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTimeModalOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg border border-border/60 bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={updateTimeMutation.isPending} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-70">
                  {updateTimeMutation.isPending ? "Saving..." : "Save Time"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DashPage>
  )
}
