"use client"

import { useState, useMemo, useEffect } from "react"
import { Loader2, Search, CheckSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingAdminResponse, useUpdateTrendingProducts } from "@/src/hooks/api/useTrending"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { useProducts } from "@/src/hooks/api/useProducts"

interface Props {
  adminData: TrendingAdminResponse
}

export function TrendingProducts({ adminData }: Props) {
  const updateProductsMutation = useUpdateTrendingProducts()

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: categories = [] } = useCategories()
  const { data: subCategories = [], isLoading: isSubCategoriesLoading } = useSubCategories(selectedCategory, { enabled: !!selectedCategory && selectedCategory !== "all" })
  
  const { data: availableProducts = [], isLoading: isProductsLoading } = useProducts({ 
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined, 
    subCategoryId: selectedSubCategory !== "all" ? selectedSubCategory : undefined,
    search: searchQuery,
    limit: 500
  })

  // Set initial selected product IDs from the backend response
  const [stagedProductIds, setStagedProductIds] = useState<Set<string>>(new Set())

  // Keep staged products synced with real campaign products
  useEffect(() => {
    if (adminData?.sources?.products) {
      setStagedProductIds(new Set(adminData.sources.products.map(p => p.productId)))
    }
  }, [adminData?.sources?.products])

  const handleToggleProduct = (productId: string) => {
    const next = new Set(stagedProductIds)
    if (next.has(productId)) {
      next.delete(productId)
    } else {
      next.add(productId)
    }
    setStagedProductIds(next)
  }

  const handleSelectAllAvailable = () => {
    const next = new Set(stagedProductIds)
    let addedCount = 0
    availableProducts.forEach((p: any) => {
      if (!next.has(p.id)) {
        next.add(p.id)
        addedCount++
      }
    })
    
    // If all were already selected, unselect them
    if (addedCount === 0) {
      availableProducts.forEach((p: any) => next.delete(p.id))
    }
    setStagedProductIds(next)
  }

  const handleSaveProducts = async () => {
    if (!adminData) return
    
    const initialSet = new Set(adminData.sources.products.map(p => p.productId))
    const currentSet = stagedProductIds
    
    const addProductIds = Array.from(currentSet).filter(id => !initialSet.has(id))
    const removeProductIds = Array.from(initialSet).filter(id => !currentSet.has(id))

    if (addProductIds.length === 0 && removeProductIds.length === 0) {
      return // No changes
    }

    await updateProductsMutation.mutateAsync({
      ...(addProductIds.length > 0 ? { addProductIds } : {}),
      ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
    })
  }

  const hasUnsavedProductChanges = useMemo(() => {
    if (!adminData) return false
    const initialSet = new Set(adminData.sources.products.map(p => p.productId))
    const currentSet = stagedProductIds
    if (initialSet.size !== currentSet.size) return true
    for (const id of currentSet) {
      if (!initialSet.has(id)) return true
    }
    return false
  }, [adminData, stagedProductIds])

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <h2 className="font-semibold text-lg">Manage Included Products</h2>
          <p className="text-sm text-muted-foreground">Select products to offer with trending.</p>
        </div>
        <Button 
          onClick={handleSaveProducts} 
          disabled={!hasUnsavedProductChanges || updateProductsMutation.isPending}
        >
          {updateProductsMutation.isPending ? "Saving..." : "Save Products"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setSelectedSubCategory("") }}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory} disabled={!selectedCategory || selectedCategory === "all" || isSubCategoriesLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subCategories.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Search products..." 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm text-muted-foreground">
          {availableProducts.length} Products Found
        </h3>
        {availableProducts.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handleSelectAllAvailable}>
            <CheckSquare className="mr-2 h-4 w-4" /> Toggle All Visible
          </Button>
        )}
      </div>

      {isProductsLoading ? (
         <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : availableProducts.length === 0 ? (
         <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-muted-foreground bg-secondary/20">
           No products found matching filters.
         </div>
      ) : (
        <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
          {availableProducts.map((p: any) => {
            const isSelected = stagedProductIds.has(p.id)
            return (
              <label 
                key={p.id} 
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-colors hover:bg-secondary/50 ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ID: {p.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isSelected && <Badge className="h-5 rounded-sm px-1.5 text-[10px]">trending</Badge>}
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => handleToggleProduct(p.id)}
                    className="h-4 w-4 accent-primary"
                  />
                </div>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
