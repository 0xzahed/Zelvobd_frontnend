"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Clock, ArrowLeft, Loader2, Tag, Search, CheckSquare } from "lucide-react"
import { format } from "date-fns"

import { 
  useFlashSaleDetails, 
  useUpdateFlashSaleTime, 
  useUpdateFlashSaleProducts 
} from "@/src/hooks/api/useFlashSales"
import { useCategories, useSubCategories } from "@/src/hooks/api/useCategories"
import { useProducts } from "@/src/hooks/api/useProducts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FlashSaleDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  
  const { data: campaign, isLoading: isCampaignLoading } = useFlashSaleDetails(id)
  
  const updateTimeMutation = useUpdateFlashSaleTime()
  const updateProductsMutation = useUpdateFlashSaleProducts()

  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [timeForm, setTimeForm] = useState({ startAt: "", endAt: "" })

  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("")

  const { data: categories = [] } = useCategories()
  const { data: subCategories = [], isLoading: isSubCategoriesLoading } = useSubCategories(selectedCategory, { enabled: !!selectedCategory })
  
  const { data: availableProducts = [], isLoading: isProductsLoading } = useProducts({ 
    categoryId: selectedCategory, 
    subCategoryId: selectedSubCategory,
    limit: 500
  })

  // Set initial selected product IDs
  const [stagedProductIds, setStagedProductIds] = useState<Set<string>>(new Set())

  // Keep staged products synced with real campaign products
  useEffect(() => {
    if (campaign?.products) {
      setStagedProductIds(new Set(campaign.products.map(p => p.productId)))
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
      }
    })
    setTimeModalOpen(false)
  }

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
    if (!campaign) return
    
    const initialSet = new Set(campaign.products.map(p => p.productId))
    const currentSet = stagedProductIds
    
    const addProductIds = Array.from(currentSet).filter(id => !initialSet.has(id))
    const removeProductIds = Array.from(initialSet).filter(id => !currentSet.has(id))

    if (addProductIds.length === 0 && removeProductIds.length === 0) {
      return // No changes
    }

    await updateProductsMutation.mutateAsync({
      id,
      payload: {
        ...(addProductIds.length > 0 ? { addProductIds } : {}),
        ...(removeProductIds.length > 0 ? { removeProductIds } : {}),
      }
    })
  }

  const hasUnsavedProductChanges = useMemo(() => {
    if (!campaign) return false
    const initialSet = new Set(campaign.products.map(p => p.productId))
    const currentSet = stagedProductIds
    if (initialSet.size !== currentSet.size) return true
    for (let id of currentSet) {
      if (!initialSet.has(id)) return true
    }
    return false
  }, [campaign, stagedProductIds])

  if (isCampaignLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!campaign) {
    return <div className="p-10 text-center text-muted-foreground">Campaign not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/flash-sale" className="rounded-full bg-secondary p-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{campaign.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={
              campaign.status === "ACTIVE" ? "default" :
              campaign.status === "SCHEDULED" ? "secondary" : "outline"
            }>
              {campaign.status}
            </Badge>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {campaign.discountType === "PERCENT" ? `${campaign.discountValue}% OFF` : `৳${campaign.discountValue} OFF`}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Campaign Info Card */}
        <div className="col-span-1 rounded-xl border bg-card p-6 shadow-sm h-fit">
          <h2 className="font-semibold text-lg border-b pb-4 mb-4">Campaign Details</h2>
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
          </div>
          
          <Button variant="outline" className="w-full mt-6" onClick={handleOpenTimeModal}>
            Edit Time
          </Button>
        </div>

        {/* Product Management Section */}
        <div className="col-span-1 md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <h2 className="font-semibold text-lg">Manage Products</h2>
              <p className="text-sm text-muted-foreground">Add or remove products from this campaign.</p>
            </div>
            <Button 
              onClick={handleSaveProducts} 
              disabled={!hasUnsavedProductChanges || updateProductsMutation.isPending}
            >
              {updateProductsMutation.isPending ? "Saving..." : "Save Products"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
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
               No products found in this category.
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
                      {isSelected && <Badge className="h-5 rounded-sm px-1.5 text-[10px]">Added</Badge>}
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
      </div>

      {/* Edit Time Modal */}
      <Dialog open={timeModalOpen} onOpenChange={setTimeModalOpen}>
        <DialogContent>
          <form onSubmit={handleTimeUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Campaign Time</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartAt">Start Time</Label>
                  <Input 
                    id="editStartAt" 
                    type="datetime-local" 
                    required 
                    value={timeForm.startAt}
                    onChange={e => setTimeForm({ ...timeForm, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEndAt">End Time</Label>
                  <Input 
                    id="editEndAt" 
                    type="datetime-local" 
                    required 
                    value={timeForm.endAt}
                    onChange={e => setTimeForm({ ...timeForm, endAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTimeModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateTimeMutation.isPending}>
                {updateTimeMutation.isPending ? "Saving..." : "Save Time"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
