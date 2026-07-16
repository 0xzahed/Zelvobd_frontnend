"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, CheckSquare, TrendingUp, Loader2 } from "lucide-react"
import { DashPage, DashHeader, DashPanel, DashLoading } from "@/dashboard/components/dash-ui"
import { Switch } from "@/components/ui/switch"
import { useTrendingAdmin, useUpdateTrendingCampaign, useUpdateTrendingProducts } from "@/src/hooks/api/useTrending"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { useProducts } from "@/src/hooks/api/useProducts"

export default function DashboardTrendingPage() {
  const { data: adminData, isLoading } = useTrendingAdmin()
  const updateCampaignMutation = useUpdateTrendingCampaign()
  const updateProductsMutation = useUpdateTrendingProducts()

  const [isActive, setIsActive] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [stagedProductIds, setStagedProductIds] = useState<Set<string>>(new Set())

  const { data: categories = [] } = useCategories()
  const { data: subCategories = [], isLoading: isSubCategoriesLoading } = useSubCategories(selectedCategory, {
    enabled: !!selectedCategory && selectedCategory !== "all",
  })

  const { data: availableProducts = [], isLoading: isProductsLoading } = useProducts(
    {
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      subCategoryId: selectedSubCategory !== "all" ? selectedSubCategory : undefined,
      search: searchQuery,
      limit: 100,
    },
    { includeUnavailable: true }
  )

  useEffect(() => {
    if (adminData?.sources?.products) {
      setIsActive(adminData.isActive)
      setStagedProductIds(new Set(adminData.sources.products.map((p) => p.productId)))
    }
  }, [adminData])

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked)
    await updateCampaignMutation.mutateAsync({ isActive: checked })
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

  const handleSave = async () => {
    if (!adminData) return
    const initialSet = new Set(adminData.sources.products.map((p) => p.productId))
    const addProductIds = Array.from(stagedProductIds).filter((id) => !initialSet.has(id))
    const removeProductIds = Array.from(initialSet).filter((id) => !stagedProductIds.has(id))
    if (addProductIds.length === 0 && removeProductIds.length === 0) return
    await updateProductsMutation.mutateAsync({
      ...(addProductIds.length > 0 ? { addProductIds } : {}),
      ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
    })
  }

  const hasChanges = useMemo(() => {
    if (!adminData) return false
    const initialSet = new Set(adminData.sources.products.map((p) => p.productId))
    if (initialSet.size !== stagedProductIds.size) return true
    for (const id of stagedProductIds) if (!initialSet.has(id)) return true
    return false
  }, [adminData, stagedProductIds])

  if (isLoading) return <DashPage><DashLoading label="Loading trending data..." /></DashPage>

  if (!adminData) {
    return (
      <DashPage>
        <DashHeader title="Trending Products" subtitle="Manage your trending products" />
        <DashPanel>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-base font-medium text-foreground">Error loading trending data</p>
            <p className="text-sm text-muted-foreground">Please refresh the page.</p>
          </div>
        </DashPanel>
      </DashPage>
    )
  }

  return (
    <DashPage>
      <DashHeader
        title="Trending Products"
        subtitle={`${adminData.sources.products.length} products in trending`}
      />

      {/* Settings */}
      <DashPanel className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Campaign Status</p>
              <p className="text-xs text-muted-foreground">Toggle to activate trending campaign</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isActive ? "text-emerald-600" : "text-muted-foreground"}`}>
              {isActive ? "Active" : "Disabled"}
            </span>
            <Switch checked={isActive} onCheckedChange={handleToggle} disabled={updateCampaignMutation.isPending} />
          </div>
        </div>
      </DashPanel>

      {/* Product Management */}
      <DashPanel className="p-5">
        <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Manage Products</h3>
            <p className="text-xs text-muted-foreground">Select products to include in trending</p>
          </div>
          <button
            onClick={handleSave}
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
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedSubCategory("")
            }}
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

        {/* Select All */}
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

        {/* Product Grid */}
        {isProductsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableProducts.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/40 text-sm text-muted-foreground">
            No products found matching filters.
          </div>
        ) : (
          <div className="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      TRENDING
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        )}
      </DashPanel>
    </DashPage>
  )
}
