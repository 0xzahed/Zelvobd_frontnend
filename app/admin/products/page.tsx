"use client"

import { useMemo, useState } from "react"
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useAdminStore } from "@/lib/admin-store"
import type { Product } from "@/lib/types"
import { formatBDT, cx } from "@/lib/format"
import { ProductForm } from "@/components/admin/product-form"

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, copyProduct } = useAdminStore()

  const [q, setQ] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim()
    if (!lc) return products
    return products.filter((p) => p.name.toLowerCase().includes(lc) || p.brand.toLowerCase().includes(lc))
  }, [products, q])

  const onSave = (p: Product) => {
    if (products.find((x) => x.id === p.id)) {
      updateProduct(p.id, p)
    } else {
      addProduct(p)
    }
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Products</h2>
          <p className="text-xs text-muted-foreground">{products.length} total</p>
        </div>
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3 shadow-card md:w-72 md:flex-none">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#3B6CF4] px-4 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {showForm && (
        <ProductForm
          initial={editing ?? undefined}
          onSave={onSave}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}

      <div className="overflow-hidden rounded-lg bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-[#EEF0FB]/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Flags</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EEF0FB] text-xs font-semibold text-[#3B6CF4]">
                        {p.brand.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.categorySlug} / {p.subCategorySlug}
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
                        p.stock > 20 ? "bg-green-50 text-[#22C55E]" : p.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-[#FF3B3B]",
                      )}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {p.isTrending && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#3B6CF4]">
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
                      <button
                        onClick={() => {
                          setEditing(p)
                          setShowForm(true)
                        }}
                        aria-label="Edit"
                        title="Edit"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => copyProduct(p.id)}
                        aria-label="Copy"
                        title="Duplicate"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF0FB] text-[#3B6CF4]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        aria-label="Delete"
                        title="Delete"
                        className="grid h-8 w-8 place-items-center rounded-full bg-[#FF3B3B]/10 text-[#FF3B3B]"
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
