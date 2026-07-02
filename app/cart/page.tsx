'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { AppShell } from '@/components/layout/app-shell';
import { useCart } from '@/contexts/cart-context';
import { formatBDT } from '@/lib/format';
import { useProducts } from '@/src/hooks/api/useProducts';
import { applyPromoAPI } from '@/src/api/promo/applyPromo';
import { CartSkeleton } from '@/components/ui/skeletons/cart-skeleton';
import { notify } from '@/lib/notify';
import { getProductDetails } from '@/src/api/products/getProductDetails';
import { mapProduct } from '@/src/api/_shared/mappers';
import { placeOrderAPI } from '@/src/api/orders/placeOrder';
import { ShinyText } from '@/components/ui/shiny-text';
import { FloatingRotatingIcon } from '@/components/home/floating-rotating-icon';

function colorToHex(name: string): string {
  const key = name.toLowerCase();
  const map: Record<string, string> = {
    black: '#111827',
    'black titanium': '#1f2937',
    white: '#F3F4F6',
    'white titanium': '#E5E7EB',
    silver: '#C0C4CC',
    gold: '#E9C687',
    'rose gold': '#E6B8A2',
    blue: '#2563EB',
    'blue titanium': '#4A5A70',
    'midnight blue': '#1E3A5F',
    'natural titanium': '#A9A299',
    'desert titanium': '#C8B5A3',
    moonstone: '#A8B0B9',
    jade: '#3A8F6B',
    obsidian: '#111827',
    porcelain: '#F1EEE8',
    graphite: '#3A3A3A',
    coral: '#F0746E',
    lemongrass: '#A9B85A',
    sky: '#7CB6E8',
    red: '#DC2626',
    green: '#16A34A',
    pink: '#F472B6',
    purple: '#8B5CF6',
    gray: '#6B7280',
    grey: '#6B7280',
    brown: '#8B5E3C',
    beige: '#D6C6A8',
    navy: '#1E3A8A',
    midnight: '#1B1F2A',
  };
  if (map[key]) return map[key];
  for (const k of Object.keys(map)) {
    if (key.includes(k)) return map[k];
  }
  return '#9CA3AF';
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, appliedPromo, applyPromo, removePromo } =
    useCart();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [detailMap, setDetailMap] = useState<Record<string, Product>>({});

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [location, setLocation] = useState<'Inside Dhaka' | 'Outside Dhaka' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const enriched = items
    .map((item) => {
      const p = detailMap[item.productId] || products.find((prod: Product) => prod.id === item.productId);
      return p ? { ...item, product: p } : null;
    })
    .filter(Boolean) as Array<{
    productId: string;
    quantity: number;
    color?: string;
    storage?: string;
    product: Product;
  }>;

  const getDisplayVariant = (item: { color?: string; storage?: string; product: Product }) => {
    const variants = item.product.variants || [];
    if (variants.length === 0) return { color: item.color, size: item.storage, image: undefined, data: null };

    const norm = (val?: string) => (val || '').trim().toLowerCase();
    const itemColor = norm(item.color);
    const itemSize = norm(item.storage);

    const matchesColor = (v: any) => norm(v.color) === itemColor;
    const matchesSize = (v: any) => v.size.split(',').map(norm).includes(itemSize);

    if (item.color && item.storage) {
      const exact = variants.find((v) => matchesColor(v) && matchesSize(v));
      if (exact) return { color: item.color, size: item.storage, image: exact.image, data: exact };
    }

    const byColor = item.color ? variants.find(matchesColor) : null;
    if (byColor) {
      return {
        color: item.color,
        size: item.storage || byColor.size.split(',')[0].trim(),
        image: byColor.image,
        data: byColor
      };
    }

    const bySize = item.storage ? variants.find(matchesSize) : null;
    if (bySize) {
      return {
        color: item.color || bySize.color,
        size: item.storage,
        image: bySize.image,
        data: bySize
      };
    }

    return {
      color: item.color || variants[0]?.color,
      size: item.storage || variants[0]?.size.split(',')[0].trim(),
      image: variants[0]?.image,
      data: variants[0] || null
    };
  };

  const getVariantPrice = (product: Product, variantData: any) => {
    if (!variantData) return product.price;
    return product.isFlashSale && variantData.flashSalePrice != null
      ? Number(variantData.flashSalePrice)
      : Number(variantData.discountedPrice || product.price);
  };

  const subtotal = enriched.reduce((s, i) => {
    const displayVariant = getDisplayVariant(i);
    const price = getVariantPrice(i.product, displayVariant.data);
    return s + price * i.quantity;
  }, 0);

  const paidDeliveryItems = enriched.filter((i) => !i.product.isFreeDelivery);
  const allItemsFree = enriched.length > 0 && paidDeliveryItems.length === 0;

  let shippingTax = 0;
  if (subtotal > 0 && !allItemsFree && location) {
    const baseCharge = location === 'Inside Dhaka' ? 100 : 150;
    const totalWeight = paidDeliveryItems.reduce(
      (sum, item) => sum + (parseFloat(item.product.weight || '0') || 0) * item.quantity,
      0
    );
    const extraWeight = Math.max(0, totalWeight - 1);
    const extraCharge = extraWeight * 20;
    shippingTax = baseCharge + extraCharge;
  }
  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = Math.max(0, subtotal + shippingTax - discountAmount);

  const keyForItem = (item: { productId: string; color?: string; storage?: string }) =>
    `${item.productId}__${item.color || ''}__${item.storage || ''}`;

  const getVariantLabels = (item: { color?: string; storage?: string; product: Product }) => {
    const displayVariant = getDisplayVariant(item);
    const color = (displayVariant.color || '').trim();
    const size = (displayVariant.size || '').trim();
    const shouldShow = Boolean(color || size);
    return { color, size, shouldShow };
  };

  const getEditUrl = (item: { color?: string; storage?: string; product: Product }) => {
    const p = item.product;
    const baseUrl = `/${p.categorySlug || 'all'}/${p.subCategorySlug || 'all'}/${p.slug || p.id}`;
    const variants = p.variants || [];
    if (variants.length === 0) return baseUrl;

    const norm = (v?: string) => (v || '').trim().toLowerCase();
    const selected = getDisplayVariant(item);
    const selectedColor = norm(selected.color);
    const selectedSize = norm(selected.size);

    const matched =
      variants.find((v) => norm(v.color) === selectedColor && norm(v.size) === selectedSize) ||
      variants.find((v) => norm(v.color) === selectedColor) ||
      variants.find((v) => norm(v.size) === selectedSize);

    return matched?.id ? `${baseUrl}/${matched.id}` : baseUrl;
  };

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      const targets = enriched
        .map((item) => item.product)
        .filter((p) => !detailMap[p.id]);

      for (const p of targets) {
        if (detailMap[p.id]) continue;
        try {
          const res = await getProductDetails(p.id);
          const mapped = mapProduct(res?.data);
          if (!cancelled) {
            setDetailMap((prev) => ({ ...prev, [p.id]: mapped }));
          }
        } catch {
          // ignore detail errors
        }
      }
    };

    if (enriched.length > 0) {
      void loadDetails();
    }

    return () => {
      cancelled = true;
    };
  }, [enriched, detailMap]);

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
      notify.error({ title: 'Error', message: 'Please enter a promo code.' });
      return;
    }

    if (subtotal === 0) {
      notify.error({ title: 'Error', message: 'Cart is empty.' });
      return;
    }

    setPromoLoading(true);
    try {
      const data = await applyPromoAPI(promoCodeInput, subtotal);
      applyPromo({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
      });
      notify.success({ title: 'Applied', message: `${data.code} applied successfully!` });
      setPromoCodeInput('');
    } catch (error: any) {
      notify.error({
        title: 'Invalid Promo Code',
        message: error.message || 'Unable to apply promo code.',
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCheckout = async () => {
    if (!form.name || !form.phone || !form.address || !location) {
      notify.error({
        title: 'Validation Error',
        message: 'Please fill in all required fields including Location',
      });
      return;
    }

    if (items.length === 0) {
      notify.error({ title: 'Error', message: 'Your cart is empty.' });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerName: form.name,
        customerPhone: form.phone,
        address: form.address,
        district: location,
        union: null,
        orderNotes: form.notes || null,
        promoCode: appliedPromo?.code || null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color || null,
          size: item.storage || null,
        })),
      };

      const orderData = await placeOrderAPI(payload);

      setOrderCode(orderData.code);
      setIsSuccess(true);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      notify.error({
        title: 'Checkout Failed',
        message: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AppShell>
        <div className='mx-auto flex min-h-[calc(100dvh-140px)] max-w-md flex-col items-center justify-center gap-5 px-4 text-center'>
          <div className='relative grid h-24 w-24 place-items-center rounded-full bg-emerald-500'>
            <svg
              className='h-12 w-12 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={3}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <div className='space-y-1'>
            <h1 className='text-xl font-bold text-foreground md:text-2xl'>অর্ডার সফল হয়েছে!</h1>
            <p className='text-sm text-muted-foreground'>
              {' '}
              অনুগ্রহ করে অপেক্ষা করুন, আমাদের প্রতিনিধি আপনার সাথে খুব দ্রুত যোগাযোগ করবেন।
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className='block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white'
          >
            হোমে ফিরে যান
          </button>
        </div>
        <FloatingRotatingIcon />
      </AppShell>
    );
  }

  if (items.length > 0 && isLoadingProducts) {
    return (
      <AppShell>
        <CartSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className='py-4 md:py-8'>
        <div className='mb-5 grid grid-cols-[40px_1fr_40px] items-center'>
          <button
            onClick={() => router.back()}
            aria-label='Back'
            className='grid h-10 w-10 place-items-center rounded-full bg-card'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <h1 className='text-center text-base font-semibold text-foreground md:text-lg'>Cart</h1>
          <button
            onClick={onTopDelete}
            aria-label='Delete all'
            className='grid h-10 w-10 place-items-center rounded-full bg-card text-foreground'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
        {enriched.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-10 text-center'>
            <div className='grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary'>
              <ShoppingBag className='h-7 w-7' />
            </div>
            <h2 className='text-base font-semibold text-foreground'>Your cart is empty</h2>
            <p className='text-sm text-muted-foreground'>
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href='/'
              className='mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white'
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className='grid gap-6 pb-24 md:grid-cols-[1fr_340px] md:pb-0'>
            <ul className='space-y-3'>
              <li className='flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2'>
                <button
                  onClick={toggleAll}
                  className='inline-flex items-center gap-2 text-sm font-medium text-foreground'
                >
                  {allSelected ? (
                    <CheckSquare className='h-4 w-4 text-primary' />
                  ) : (
                    <Square className='h-4 w-4 text-muted-foreground' />
                  )}
                  Select All
                </button>
                <span className='text-xs text-muted-foreground'>{selectedKeys.size} selected</span>
              </li>
              {enriched.map((item) => {
                const p = detailMap[item.productId] || item.product;
                const imgQuery = encodeURIComponent(`${p.name} product photo`);
                const itemKey = keyForItem(item);
                const isSelected = selectedKeys.has(itemKey);
                const variantLabels = getVariantLabels({ ...item, product: p });
                const displayVariant = getDisplayVariant({ ...item, product: p });
                const imageToUse = displayVariant.image || p.images?.[0] || `/placeholder.svg?height=200&width=200&query=${imgQuery}`;
                const activePrice = getVariantPrice(p, displayVariant.data);
                
                return (
                  <li
                    key={`${p.id}-${item.color}-${item.storage}`}
                    className={`rounded-2xl bg-card p-3 ${isSelected ? 'ring-1 ring-primary/40' : ''}`}
                  >
                    <div className='flex gap-3'>
                      <button
                        onClick={() => toggleOne(itemKey)}
                        aria-label={isSelected ? 'Unselect item' : 'Select item'}
                        className='mt-1 shrink-0 text-muted-foreground'
                      >
                        {isSelected ? (
                          <CheckSquare className='h-4 w-4 text-primary' />
                        ) : (
                          <Square className='h-4 w-4' />
                        )}
                      </button>
                      <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-muted'>
                        <Image
                          src={imageToUse}
                          alt={p.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <Link
                          href={`/${p.categorySlug || 'all'}/${p.subCategorySlug || 'all'}/${p.slug || p.id}`}
                          className='line-clamp-1 text-base font-semibold text-foreground'
                        >
                          {p.name}
                        </Link>
                        <p className='text-sm font-medium text-primary'>{p.brand}</p>
                        <p className='mt-1 text-base font-bold text-foreground'>
                          {formatBDT(activePrice)}
                        </p>
                        {variantLabels.shouldShow && (
                          <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
                            {variantLabels.color && (
                              <span className='inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2 py-1'>
                                <span
                                  className='h-3 w-3 rounded-full border border-border/60'
                                  style={{ backgroundColor: colorToHex(variantLabels.color) }}
                                  aria-hidden='true'
                                />
                                <span className='font-semibold text-foreground'>
                                  {variantLabels.color}
                                </span>
                              </span>
                            )}
                            {variantLabels.size && (
                              <span className='inline-flex items-center rounded-full border border-border/60 bg-card px-2 py-1 font-semibold text-foreground'>
                                {variantLabels.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='mt-3 flex items-center justify-between border-t border-border/60 pt-3'>
                      <button
                        onClick={() => router.push(getEditUrl({ ...item, product: p }))}
                        className='inline-flex items-center gap-1 text-sm font-medium text-primary'
                      >
                        <Pencil className='h-3.5 w-3.5' /> Edit
                      </button>
                      <div className='flex items-center gap-3'>
                        <button
                          onClick={() =>
                            updateQuantity(p.id, item.quantity - 1, item.color, item.storage)
                          }
                          className='grid h-7 w-7 place-items-center rounded-full border border-border text-foreground'
                        >
                          <Minus className='h-3 w-3' />
                        </button>
                        <span className='w-4 text-center text-sm font-semibold'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(p.id, item.quantity + 1, item.color, item.storage)
                          }
                          className='grid h-7 w-7 place-items-center rounded-full border border-primary text-primary'
                        >
                          <Plus className='h-3 w-3' />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(p.id, item.color, item.storage)}
                        className='grid h-8 w-8 place-items-center rounded-full text-foreground/60 hover:bg-foreground/5'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className='space-y-4 md:sticky md:top-20 md:self-start'>
              {appliedPromo ? (
                <div className='flex items-center justify-between rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5'>
                  <div className='flex items-center gap-2'>
                    <Ticket className='h-4 w-4 text-primary' />
                    <div>
                      <span className='text-sm font-semibold text-primary'>
                        {appliedPromo.code}
                      </span>
                      <span className='ml-2 text-xs font-medium text-muted-foreground'>
                        Applied
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removePromo}
                    className='grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent'
                    aria-label='Remove promo code'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all'>
                  <Ticket className='h-4 w-4 text-muted-foreground' />
                  <input
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder='Enter Promo Code'
                    className='flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyPromo();
                    }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCodeInput.trim()}
                    className='grid h-8 w-8 place-items-center rounded-full text-primary transition-colors hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent'
                  >
                    {promoLoading ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </button>
                </div>
              )}

              <div className='space-y-3 rounded-2xl border border-border/60 bg-card p-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Sub Total</span>
                  <span className='font-medium text-foreground'>{formatBDT(subtotal)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Shipping &amp; Tax</span>
                  <span className='font-medium text-foreground'>
                    {subtotal === 0
                      ? formatBDT(0)
                      : location === ''
                        ? 'Select Location'
                        : allItemsFree
                          ? 'Free'
                          : formatBDT(shippingTax)}
                  </span>
                </div>
                {appliedPromo && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-primary font-medium'>Discount ({appliedPromo.code})</span>
                    <span className='font-bold text-primary'>
                      - {formatBDT(appliedPromo.discountAmount)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between pt-1 border-t border-border/60 mt-1'>
                  <span className='text-base font-semibold text-foreground'>Total</span>
                  <span className='text-base font-bold text-foreground'>{formatBDT(total)}</span>
                </div>
              </div>

              <div className='space-y-3 rounded-2xl border border-border/60 bg-card p-4'>
                <h3 className='text-base font-semibold text-foreground'>Shipping Information</h3>
                <div className='grid gap-3'>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder='Full Name'
                    className='h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none focus:ring-1 focus:ring-primary'
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder='Phone Number'
                    className='h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 text-sm outline-none focus:ring-1 focus:ring-primary'
                  />
                  <textarea
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    placeholder='Address'
                    rows={2}
                    className='w-full resize-none rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary'
                  />
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <label className='flex items-center gap-3 rounded-xl border border-border/60 p-4 cursor-pointer hover:bg-muted/50 transition-colors'>
                      <input
                        type='radio'
                        name='location'
                        value='Inside Dhaka'
                        checked={location === 'Inside Dhaka'}
                        onChange={(e) => setLocation(e.target.value as 'Inside Dhaka')}
                        className='h-4 w-4 text-primary focus:ring-primary'
                      />
                      <span className='text-sm font-medium'>Inside Dhaka</span>
                    </label>
                    <label className='flex items-center gap-3 rounded-xl border border-border/60 p-4 cursor-pointer hover:bg-muted/50 transition-colors'>
                      <input
                        type='radio'
                        name='location'
                        value='Outside Dhaka'
                        checked={location === 'Outside Dhaka'}
                        onChange={(e) => setLocation(e.target.value as 'Outside Dhaka')}
                        className='h-4 w-4 text-primary focus:ring-primary'
                      />
                      <span className='text-sm font-medium'>Outside Dhaka</span>
                    </label>
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    placeholder='Order Notes (optional)'
                    rows={2}
                    className='w-full resize-none rounded-xl border border-border/60 bg-transparent px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary'
                  />
                </div>
              </div>

              <div className='fixed bottom-18 left-0 right-0 z-60 px-4 md:static md:z-auto md:bottom-0 md:p-0'>
                <button
                  type='button'
                  onClick={onCheckout}
                  disabled={isSubmitting}
                  className='flex w-full items-center justify-center gap-2 rounded-full border border-[#6C95E9] bg-[#EBF1FD] py-3.5 text-center text-sm font-semibold text-[#6C95E9] transition-all duration-300 hover:border-transparent hover:bg-[linear-gradient(45deg,#052F84,#7BA4F7)] hover:text-white active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100'
                >
                  {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
                  {isSubmitting ? 'Processing...' : <ShinyText text='Checkout' />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
