"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CheckSquare,
  Minus,
  Pencil,
  Plus,
  Square,
  ShoppingBag,
  Ticket,
  Trash2,
  Check,
  Package,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { useCart } from "@/contexts/cart-context";
import { formatBDT } from "@/lib/format";
import { useProducts } from "@/lib/use-store-data";

const BD_API_BASE = "https://bdapi.vercel.app/api/v.1";

type District = { id: string; district: string };

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { products } = useProducts();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    union: "",
    notes: "",
  });
  const [districts, setDistricts] = useState<District[]>([]);
  const [unions, setUnions] = useState<string[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [unionLoading, setUnionLoading] = useState(false);

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

  const keyForItem = (item: {
    productId: string;
    color?: string;
    storage?: string;
  }) => `${item.productId}__${item.color || ""}__${item.storage || ""}`;

  const allKeys = useMemo(() => enriched.map((item) => keyForItem(item)), [enriched]);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));

  const subtotal = enriched.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const shippingTax = subtotal === 0 ? 0 : 15;
  const total = subtotal + shippingTax;

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

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedDistrict = districts.find((d) => d.district === form.district);

  const onCheckout = () => {
    if (!form.name || !form.phone || !form.address || !form.district) {
      alert("Please fill in all required fields (Name, Phone, Address, District)");
      return;
    }

    // Simulate order placement
    const code = "EC" + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    setOrderCode(code);
    setIsSuccess(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);
        const res = await fetch(`${BD_API_BASE}/district`);
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const list: District[] = rows
          .filter((item: { id?: string; name?: string }) => item?.id && item?.name)
          .map((item: { id: string; name: string }) => ({ id: item.id, district: item.name }));
        if (!cancelled) setDistricts(list);
      } catch {
        if (!cancelled) setDistricts([]);
      } finally {
        if (!cancelled) setDistrictLoading(false);
      }
    };
    void loadDistricts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadUnions = async () => {
      if (!selectedDistrict) {
        setUnions([]);
        return;
      }
      try {
        setUnionLoading(true);
        const upRes = await fetch(`${BD_API_BASE}/upazilla/${encodeURIComponent(selectedDistrict.id)}`);
        const upJson = await upRes.json();
        const upazillas: { id: string }[] = Array.isArray(upJson?.data) ? upJson.data : [];
        const results = await Promise.all(
          upazillas.map((u) =>
            fetch(`${BD_API_BASE}/union/${encodeURIComponent(u.id)}`)
              .then((r) => r.json())
              .then((j) => (Array.isArray(j?.data) ? j.data : []))
              .catch(() => [])
          )
        );
        const list: string[] = results
          .flat()
          .map((item: { name?: string }) => item?.name)
          .filter((v): v is string => Boolean(v));
        if (!cancelled) setUnions(list);
      } catch {
        if (!cancelled) setUnions([]);
      } finally {
        if (!cancelled) setUnionLoading(false);
      }
    };
    void loadUnions();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  return (
    <AppShell>
      <div className="py-4 md:py-8">
        {isSuccess ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-8 text-center md:py-16">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full border border-success/20" />
              <div className="absolute inset-0 z-0 animate-ping rounded-full bg-success/30" />
              <div className="relative grid h-24 w-24 place-items-center rounded-full bg-success text-white shadow-[0_14px_30px_rgba(34,197,94,0.35)]">
                <Check className="h-11 w-11 animate-[pulse_1.5s_ease-in-out_infinite]" strokeWidth={3} />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground md:text-2xl">অভিনন্দন!</h1>
              <p className="text-sm text-muted-foreground">
                আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
              </p>
            </div>

            <div className="w-full rounded-2xl bg-card p-5 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4" />
                Order Code
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {orderCode}
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white"
            >
              হোমে ফিরে যান
            </button>
          </div>
        ) : (
          <>
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
              <div className="grid gap-6 md:grid-cols-[1fr_380px]">
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
                  <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Enter Promo Code"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3 px-2">
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
                      <h3 className="text-sm font-semibold text-foreground">Information</h3>
                      <input
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        placeholder="Full Name"
                        className="h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 text-sm outline-none"
                      />
                      <input
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        placeholder="Phone Number"
                        className="h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 text-sm outline-none"
                      />
                      <input
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        placeholder="Email (optional)"
                        className="h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 text-sm outline-none"
                      />
                      <textarea
                        value={form.address}
                        onChange={(e) => updateForm("address", e.target.value)}
                        placeholder="Address"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none"
                      />
                      <select
                        value={form.district}
                        onChange={(e) => {
                          const district = e.target.value;
                          setForm((prev) => ({ ...prev, district, union: "" }));
                        }}
                        className="h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 text-sm outline-none"
                      >
                        <option value="">
                          {districtLoading ? "Loading districts..." : "Select District"}
                        </option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.district}>
                            {d.district}
                          </option>
                        ))}
                      </select>
                      <select
                        value={form.union}
                        onChange={(e) => updateForm("union", e.target.value)}
                        disabled={!form.district || unionLoading}
                        className="h-10 w-full rounded-lg border border-border/60 bg-transparent px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {!form.district
                            ? "Select District First"
                            : unionLoading
                              ? "Loading unions..."
                              : "Select Union"}
                        </option>
                        {unions.map((union) => (
                          <option key={union} value={union}>
                            {union}
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        placeholder="Order Notes (optional)"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sub Total</span>
                      <span className="font-medium text-foreground">
                        {formatBDT(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shipping &amp; Tax
                      </span>
                      <span className="font-medium text-foreground">
                        {formatBDT(shippingTax)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-base font-semibold text-foreground">
                        Total
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {formatBDT(total)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onCheckout}
                    className="block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
