"use client"

import { useMemo, useState } from "react"
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { useProducts, useDeleteProduct, useCopyProduct } from "@/src/hooks/api/useProducts"

export default function AdminProductsPage() {
  const { data: products = [], isLoading } = useProducts()
  const deleteMutation = useDeleteProduct()
  const copyMutation = useCopyProduct()
  const confirm = useConfirm()

  const [q, setQ] = useState("")

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

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim()
    if (!lc) return products
    return products.filter((p) => p.name.toLowerCase().includes(lc) || p.brand.toLowerCase().includes(lc))
  }, [products, q])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Products</h2>
          <p className="text-xs text-muted-foreground">{products.length} total</p>
        </div>
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-sm bg-card px-3 shadow-sm md:w-72 md:flex-none">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-sm bg-[#306FD7] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2E55C9]"
          >
            <Plus className="h-4 w-4" /> Add
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-245 text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-[#EEF0FB]/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Sub Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Flags</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#306FD7] border-t-transparent" />
                       <p className="text-xs text-muted-foreground">Loading products...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-b-0 transition hover:bg-[#F7F9FD]/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#EEF0FB]">
                        <Image
                          src={p.images?.[0] || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand || "No Brand"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.categoryName || p.categorySlug || "Uncategorized"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.subCategoryName || p.subCategorySlug || "No sub-category"}
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatBDT(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-[#FF3B3B]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF3B3B]">
                      -{p.discount}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cx(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        p.stock ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#FF3B3B]",
                      )}
                    >
                      {p.stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {p.isTrending && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#306FD7]">
                          Trending
                        </span>
                      )}
                      {p.isFlashSale && (
                        <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-[#FF3B3B]">
                          Flash
                        </span>
                      )}
                      {p.isFreeDelivery && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                          Free
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label="Edit"
                        title="Edit"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-foreground transition hover:bg-[#306FD7] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleCopy(p.id)}
                        disabled={copyMutation.isPending}
                        aria-label="Copy"
                        title="Duplicate"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-[#306FD7] transition hover:bg-[#306FD7] hover:text-white disabled:opacity-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete"
                        title="Delete"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#FF3B3B]/10 text-[#FF3B3B] transition hover:bg-[#FF3B3B] hover:text-white disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
