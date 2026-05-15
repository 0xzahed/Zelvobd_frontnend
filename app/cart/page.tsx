"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckSquare,
  ChevronRight,
  Minus,
  Pencil,
  Plus,
  Square,
  ShoppingBag,
  Ticket,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { useCart } from "@/contexts/cart-context";
import { formatBDT } from "@/lib/format";
import { useProducts } from "@/lib/use-store-data";
import { applyPromoAPI } from "@/src/api/promo/applyPromo";
import { notify } from "@/lib/notify";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, appliedPromo, applyPromo, removePromo } = useCart();
  const { products } = useProducts();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const enriched = items
    .map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return p ? { ...item, product: p } : null;
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    color?: string;
    storage?: string;
    product: Product;
  }>;

  const subtotal = enriched.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingTax = subtotal === 0 ? 0 : 15;
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal + shippingTax - discountAmount);

  const keyForItem = (item: {
    productId: string;
    color?: string;
    storage?: string;
  }) => `${item.productId}__${item.color || ""}__${item.storage || ""}`;

  const allKeys = useMemo(() => enriched.map((item) => keyForItem(item)), [enriched]);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));


  const toggleOne = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedKeys((prev) => {
      if (allSelected) return new Set();
      return new Set(allKeys);
    });
  };

  const deleteSelected = () => {
    enriched.forEach((item) => {
      const key = keyForItem(item);
      if (selectedKeys.has(key)) {
        removeItem(item.productId, item.color, item.storage);
      }
    });
    setSelectedKeys(new Set());
  };

  const onTopDelete = () => {
    if (selectedKeys.size > 0) {
      deleteSelected();
      return;
    }
    clearCart();
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      notify.error({ title: "Error", message: "Please enter a promo code." })
      return
    }

    if (subtotal === 0) {
      notify.error({ title: "Error", message: "Cart is empty." })
      return
    }

    setPromoLoading(true)
    try {
      const data = await applyPromoAPI(promoCodeInput, subtotal)
      applyPromo({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType
      })
      notify.success({ title: "Applied", message: `${data.code} applied successfully!` })
      setPromoCodeInput("")
    } catch (error: any) {
      notify.error({ 
        title: "Invalid Promo Code", 
        message: error.message || "Unable to apply promo code." 
      })
    } finally {
      setPromoLoading(false)
    }
  }


  return (
    <AppShell>
      <div className="py-4 md:py-8">
        <div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center text-base font-semibold text-foreground md:text-lg">
            Cart
          </h1>
          <button
            onClick={onTopDelete}
            aria-label="Delete all"
            className="grid h-10 w-10 place-items-center rounded-full bg-card text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {enriched.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Your cart is empty
            </h2>
            <p className="text-sm text-muted-foreground">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_340px]">
            <ul className="space-y-3">
              <li className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2">
                <button
                  onClick={toggleAll}
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                  Select All
                </button>
                <span className="text-xs text-muted-foreground">
                  {selectedKeys.size} selected
                </span>
              </li>
              {enriched.map((item) => {
                const p = item.product;
                const imgQuery = encodeURIComponent(`${p.name} product photo`);
                const itemKey = keyForItem(item);
                const isSelected = selectedKeys.has(itemKey);
                return (
                  <li
                    key={`${p.id}-${item.color}-${item.storage}`}
                    className={`rounded-2xl bg-card p-3 ${isSelected ? "ring-1 ring-primary/40" : ""}`}
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleOne(itemKey)}
                        aria-label={isSelected ? "Unselect item" : "Select item"}
                        className="mt-1 shrink-0 text-muted-foreground"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={
                            p.images?.[0] ||
                            `/placeholder.svg?height=200&width=200&query=${imgQuery}`
                          }
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/${p.categorySlug || 'all'}/${p.subCategorySlug || 'all'}/${p.slug || p.id}`}
                          className="line-clamp-1 text-base font-semibold text-foreground"
                        >
                          {p.name}
                        </Link>
                        <p className="text-sm font-medium text-primary">
                          {p.brand}
                        </p>
                        {(item.color || item.storage) && (
                          <p className="text-xs text-muted-foreground">
                            {[
                              item.color ? `Color: ${item.color}` : null,
                              item.storage ? `Size: ${item.storage}` : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                        <p className="mt-1 text-base font-bold text-foreground">
                          {formatBDT(p.price)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                      <button className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              p.id,
                              item.quantity - 1,
                              item.color,
                              item.storage,
                            )
                          }
                          className="grid h-7 w-7 place-items-center rounded-full border border-border text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              p.id,
                              item.quantity + 1,
                              item.color,
                              item.storage,
                            )
                          }
                          className="grid h-7 w-7 place-items-center rounded-full border border-primary text-primary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(p.id, item.color, item.storage)
                        }
                        className="grid h-8 w-8 place-items-center rounded-full text-foreground/60 hover:bg-foreground/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-4 md:sticky md:top-20 md:self-start">
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-semibold text-primary">{appliedPromo.code}</span>
                      <span className="ml-2 text-xs font-medium text-muted-foreground">Applied</span>
                    </div>
                  </div>
                  <button 
                    onClick={removePromo}
                    className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent"
                    aria-label="Remove promo code"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Promo Code"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyPromo()
                    }}
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCodeInput.trim()}
                    className="grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              )}

              <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sub Total</span>
                  <span className="font-medium text-foreground">
                    {formatBDT(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping &amp; Tax</span>
                  <span className="font-medium text-foreground">
                    {formatBDT(shippingTax)}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium">Discount ({appliedPromo.code})</span>
                    <span className="font-bold text-primary">
                      - {formatBDT(appliedPromo.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/60 mt-1">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-base font-bold text-foreground">
                    {formatBDT(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
