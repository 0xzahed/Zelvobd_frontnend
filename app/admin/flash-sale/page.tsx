"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, MoreVertical, Plus, Tag, Trash, Edit, Clock } from "lucide-react"
import { format } from "date-fns"

import { useFlashSales, useCreateFlashSale, useDeleteFlashSale } from "@/src/hooks/api/useFlashSales"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { Badge } from "@/components/ui/badge"

export default function AdminFlashSaleListPage() {
  const { data, isLoading } = useFlashSales(1, 100)
  const campaigns = data?.campaigns || []

  const [createOpen, setCreateOpen] = useState(false)

  const createMutation = useCreateFlashSale()
  const deleteMutation = useDeleteFlashSale()
  const confirm = useConfirm()

  const [formData, setFormData] = useState({
    title: "",
    startAt: "",
    endAt: "",
    discountType: "PERCENT" as "PERCENT" | "TAKA",
    discountValue: "",
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.startAt || !formData.endAt) return
    
    await createMutation.mutateAsync({
      title: formData.title,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: new Date(formData.endAt).toISOString(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      productIds: [],
    })
    
    setCreateOpen(false)
    setFormData({ title: "", startAt: "", endAt: "", discountType: "PERCENT", discountValue: "" })
  }

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Flash Sale",
      message: "Are you sure you want to delete this campaign? This will remove the discount from all associated products. This action cannot be undone.",
      confirmText: "Delete Campaign",
      variant: "danger"
    })
    
    if (confirmed) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-foreground md:text-3xl md:font-bold md:tracking-tight">
            Flash Sales
          </h1>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-sm">
              <Plus className="mr-2 hidden h-4 w-4 md:inline-flex" />
              <span className="md:hidden">Add</span>
              <span className="hidden md:inline">Add New Campaign</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Flash Sale</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input 
                    id="title" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Eid Special Flash Sale"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startAt">Start Time</Label>
                    <Input 
                      id="startAt" 
                      type="datetime-local" 
                      required 
                      value={formData.startAt}
                      onChange={e => setFormData({ ...formData, startAt: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endAt">End Time</Label>
                    <Input 
                      id="endAt" 
                      type="datetime-local" 
                      required 
                      value={formData.endAt}
                      onChange={e => setFormData({ ...formData, endAt: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type</Label>
                    <Select 
                      value={formData.discountType} 
                      onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                        <SelectItem value="TAKA">Flat Amount (৳)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Discount Value</Label>
                    <Input 
                      id="discountValue" 
                      type="number" 
                      min="1"
                      required 
                      value={formData.discountValue}
                      onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card/50 text-muted-foreground">
          <Tag className="h-8 w-8 opacity-20" />
          <p>No flash sales created yet.</p>
          <Button variant="outline" className="mt-2" onClick={() => setCreateOpen(true)}>
            Create your first campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="group relative rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md md:p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1 md:text-base" title={campaign.title}>
                    {campaign.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/flash-sale/${campaign.id}`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Manage
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground md:mt-6 md:text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 opacity-70 md:h-4 md:w-4" />
                  <span>{format(new Date(campaign.startAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 opacity-70 md:h-4 md:w-4" />
                  <span>{format(new Date(campaign.endAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 border-t pt-2 mt-3">
                  <span className="font-medium text-foreground">{campaign.productCount}</span>
                  <span>products selected</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
