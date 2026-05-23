"use client"

import { useMemo, useState } from "react"
import { Copy, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { useConfirm } from "@/components/ui/confirm-dialog"
import {
  useProducts,
  useDeleteProduct,
  useCopyProduct,
  useCreateProduct,
  useToggleProductField,
} from "@/src/hooks/api/useProducts"
import { ProductForm } from "@/components/admin/product-form"
import { ProductViewDialog } from "@/components/admin/product-view-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const deleteMutation = useDeleteProduct()
  const copyMutation = useCopyProduct()
  const createMutation = useCreateProduct()
  const toggleMutation = useToggleProductField()
  const confirm = useConfirm()

  const [q, setQ] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [viewProductId, setViewProductId] = useState<string | null>(null)

  const handleDelete = async (p: Product) => {
    const ok = await confirm({
      title: "Delete product?",
      message: `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    })
    if (ok) {
      deleteMutation.mutate(p.id)
    }
  }

  const handleCopy = (id: string) => {
    copyMutation.mutate(id)
  }

  const handleToggle = (id: string, field: "stock" | "availability", value: boolean) => {
    toggleMutation.mutate({ id, field, value })
  }

  const handleCreate = (
    product: Product,
    descriptionDelta: any,
    extraDescriptionDelta: any,
    categoryId: string,
    subCategoryId: string,
  ) => {
    createMutation.mutate(
      {
        product,
        descriptionDelta,
        extraDescriptionDelta,
        categoryId,
        subCategoryId,
      },
      {
        onSuccess: () => {
          setAddOpen(false)
        },
      },
    )
  }

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim()
    if (!lc) return products
    return products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(lc) || (p.brand || "").toLowerCase().includes(lc),
    )
  }, [products, q])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Products</h2>
          <p className="text-xs text-muted-foreground">{products.length} total</p>
        </div>
        <div className="flex w-full items-center gap-2">
          <div className="flex h-10 min-w-0 flex-3 items-center gap-2 rounded-sm bg-card px-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            <Plus className="hidden h-4 w-4 md:inline-flex" />
            <span className="md:hidden">Add</span>
            <span className="hidden md:inline">Add Product</span>
          </button>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[85dvh] flex-col overflow-hidden sm:max-w-5xl"
        >
          <div className="sticky top-0 z-10 -mx-6 -mt-6 border-b border-border/60 bg-background/95 px-6 pt-1 pb-2 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="text-left">
                <DialogTitle>New Product</DialogTitle>
                <DialogDescription>Add a new product to the catalog.</DialogDescription>
              </DialogHeader>
              <DialogClose
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </DialogClose>
            </div>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
            <ProductForm
              onSave={handleCreate}
              onCancel={() => setAddOpen(false)}
              isSaving={createMutation.isPending}
              variant="plain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <ProductViewDialog
        productId={viewProductId}
        open={Boolean(viewProductId)}
        onOpenChange={(open) => {
          if (!open) {
            setViewProductId(null)
          }
        }}
      />

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && (
          <div className="col-span-full rounded-sm border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">Loading products...</p>
            </div>
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full rounded-sm border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground">
            No products found.
          </div>
        )}
        {!isLoading && filtered.map((p: any) => (
          <div key={p.id} className="flex rounded-sm border border-border/40 bg-card shadow-sm transition hover:bg-secondary/30 overflow-hidden">
            <div className="relative h-auto w-28 shrink-0 self-stretch overflow-hidden rounded-l-sm border-r border-border/40 bg-muted/10">
              <Image
                src={p.images?.[0] || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="112px"
                className="object-contain p-1.5"
                unoptimized
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between p-3 min-h-35">
              <div>
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand || "No Brand"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.categoryName || p.categorySlug || "Uncategorized"}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{formatBDT(p.price)}</span>
                  {p.discount > 0 && (
                    <span className="rounded bg-accent/10 px-1.5 py-px text-[10px] font-semibold text-accent">
                      -{p.discount}%
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Switch
                      checked={Boolean(p.stock)}
                      onCheckedChange={(val) => handleToggle(p.id, "stock", val)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.id === p.id && toggleMutation.variables?.field === "stock"}
                    />
                    Stock
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Switch
                      checked={Boolean(p.availability)}
                      onCheckedChange={(val) => handleToggle(p.id, "availability", val)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.id === p.id && toggleMutation.variables?.field === "availability"}
                    />
                    Avail
                  </label>
                  {p.isTrending && (
                    <span className="rounded-full bg-blue-50 px-1.5 py-px text-[9px] font-semibold text-primary">Trend</span>
                  )}
                  {p.isFlashSale && (
                    <span className="rounded-full bg-pink-50 px-1.5 py-px text-[9px] font-semibold text-accent">Flash</span>
                  )}
                  {p.isFreeDelivery && (
                    <span className="rounded-full bg-green-50 px-1.5 py-px text-[9px] font-semibold text-success">Free</span>
                  )}
                </div>
              </div>
              <div className="flex w-full gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => setViewProductId(p.id)}
                  aria-label="View"
                  className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-secondary h-7 text-foreground transition hover:bg-primary hover:text-white md:gap-1.5"
                >
                  <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="text-[10px] font-semibold leading-none">View</span>
                </button>
                <Link
                  href={`/admin/products/${p.id}`}
                  aria-label="Edit"
                  className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-secondary h-7 text-foreground transition hover:bg-primary hover:text-white md:gap-1.5"
                >
                  <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="text-[10px] font-semibold leading-none">Edit</span>
                </Link>
                <button
                  onClick={() => handleCopy(p.id)}
                  disabled={copyMutation.isPending}
                  aria-label="Copy"
                  className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-secondary h-7 text-primary transition hover:bg-primary hover:text-white disabled:opacity-50 md:gap-1.5"
                >
                  <Copy className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="text-[10px] font-semibold leading-none">Copy</span>
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deleteMutation.isPending}
                  aria-label="Delete"
                  className="flex flex-1 items-center justify-center gap-1 rounded-sm bg-accent/10 h-7 text-accent transition hover:bg-accent hover:text-white disabled:opacity-50 md:gap-1.5"
                >
                  <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="text-[10px] font-semibold leading-none">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
