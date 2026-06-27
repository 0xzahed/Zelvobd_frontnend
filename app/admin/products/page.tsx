"use client"

import { useMemo, useState } from "react"
import { Copy, Eye, Pencil, Plus, Trash2, X } from "lucide-react"
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
import { ProductEditDialog } from "@/components/admin/product-edit-dialog"
import {
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/admin-ui"
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
  const [editProductId, setEditProductId] = useState<string | null>(null)

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
    <AdminPage>
      <AdminPageHeader
        title="Products"
        count={`${products.length} total`}
        actions={
          <AdminToolbar>
            <AdminSearchInput
              value={q}
              onChange={setQ}
              placeholder="Search products..."
            />
            <AdminPrimaryButton onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="md:hidden">Add</span>
              <span className="hidden md:inline">Add Product</span>
            </AdminPrimaryButton>
          </AdminToolbar>
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-dvh w-screen max-w-[100vw]! flex-col overflow-hidden rounded-none border-0 p-0 sm:h-auto sm:max-h-[85dvh] sm:max-w-5xl! sm:rounded-2xl sm:border sm:border-border/60 sm:p-6 sm:shadow-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 sm:py-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-bold sm:text-xl">New Product</DialogTitle>
              <DialogDescription className="hidden text-sm sm:block">Add a new product to the catalog.</DialogDescription>
            </DialogHeader>
            <DialogClose
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full bg-muted/40 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-0 sm:pt-6">
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

      <ProductEditDialog
        productId={editProductId}
        open={Boolean(editProductId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditProductId(null)
          }
        }}
      />

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="col-span-full rounded-xl border border-border/70 bg-card">
            <AdminLoadingState label="Loading products..." />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
            No products found.
          </div>
        )}
        {!isLoading && filtered.map((p: any) => (
          <div key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition hover:border-primary/20 hover:shadow-md sm:h-48 sm:flex-row">
            {/* Image */}
            <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted/10 sm:h-full sm:w-36 sm:border-r sm:border-border/40">
              <Image
                src={p.images?.[0] || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 100vw, 144px"
                className="object-contain p-2"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
              {/* Top info */}
              <div className="space-y-2">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:line-clamp-1">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.brand || "No Brand"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.categoryName || p.categorySlug || "Uncategorized"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {formatBDT(p.price)}
                  </span>
                  {p.discount > 0 && (
                    <span className="rounded bg-accent/10 px-1.5 py-px text-[10px] font-semibold text-accent">
                      -{p.discount}%
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Switch
                      checked={Boolean(p.stock)}
                      onCheckedChange={(val) => handleToggle(p.id, "stock", val)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.id === p.id && toggleMutation.variables?.field === "stock"}
                    />
                    Stock
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Switch
                      checked={Boolean(p.availability)}
                      onCheckedChange={(val) => handleToggle(p.id, "availability", val)}
                      disabled={toggleMutation.isPending && toggleMutation.variables?.id === p.id && toggleMutation.variables?.field === "availability"}
                    />
                    Avail
                  </label>
                  {p.isTrending && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">Trending</span>
                  )}
                  {p.isFlashSale && (
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-accent">Flash</span>
                  )}
                  {p.isFreeDelivery && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Free</span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setViewProductId(p.id)}
                  aria-label="View"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-sm bg-secondary px-2 text-foreground transition hover:bg-primary hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden text-[11px] font-semibold sm:inline">View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditProductId(p.id)}
                  aria-label="Edit"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-sm bg-secondary px-2 text-foreground transition hover:bg-primary hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleCopy(p.id)}
                  disabled={copyMutation.isPending}
                  aria-label="Copy"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-sm bg-secondary px-2 text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Copy</span>
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deleteMutation.isPending}
                  aria-label="Delete"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-sm bg-red-50 px-2 text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden text-[11px] font-semibold sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  )
}
