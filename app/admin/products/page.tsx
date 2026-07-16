'use client';

import { useConfirm } from '@/components/ui/confirm-dialog';
import { DashHeader, DashLoading, DashPage, DashPanel } from '@/dashboard/components/dash-ui';
import { ViewToggle, type ViewMode } from '@/dashboard/components/view-toggle';
import { cx, formatBDT } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCategories } from '@/src/hooks/api/useCategories';
import {
  useCopyProduct,
  useDeleteProduct,
  useProducts,
  useToggleProductField,
} from '@/src/hooks/api/useProducts';
import { ProductEditDialog } from './product-edit-dialog';
import { ProductViewDialog } from './product-view-dialog';
import { Copy, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardProductsPage() {
  const { data: products = [], isLoading } = useProducts({ limit: 1000 });
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();
  const copyMutation = useCopyProduct();
  const toggleMutation = useToggleProductField();
  const copyingIdRef = useRef<string | null>(null);
  const confirm = useConfirm();
  const router = useRouter();

  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const rowsPerPage = 10;

  const openAdd = () => {
    router.push('/admin/products/new');
  };

  const openView = (p: Product) => {
    setViewProductId(p.id);
    setShowViewModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProductId(p.id);
    setShowEditModal(true);
  };

  const handleDelete = async (p: Product) => {
    const ok = await confirm({
      title: 'Delete product?',
      message: `Are you sure you want to delete "${p.name}"?`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(p.id);
  };

  const handleToggle = (id: string, field: 'stock' | 'availability', value: boolean) => {
    toggleMutation.mutate({ id, field, value });
  };

  const filtered = useMemo(() => {
    let list = [...products];
    const lc = q.toLowerCase().trim();
    if (lc) {
      list = list.filter(
        (p: any) => p.name.toLowerCase().includes(lc) || (p.brand || '').toLowerCase().includes(lc),
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter(
        (p: any) => p.categoryId === categoryFilter || p.categorySlug === categoryFilter,
      );
    }
    if (stockFilter === 'in') list = list.filter((p: any) => p.stock);
    if (stockFilter === 'out') list = list.filter((p: any) => !p.stock);
    return list;
  }, [products, q, categoryFilter, stockFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader
          title='Products List'
          subtitle="Track your store's progress to boost your sales."
        />
        <DashLoading label='Loading products...' />
      </DashPage>
    );
  }

  return (
    <DashPage>
      <DashHeader
        title='Products List'
        subtitle="Track your store's progress to boost your sales."
      />

      {/* Filters */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
        <div className='flex w-full md:w-auto items-center gap-2'>
          <div className='flex flex-1 h-10 min-w-0 md:max-w-xs items-center gap-2 rounded-lg border border-border/60 bg-card px-3'>
            <Search className='h-4 w-4 shrink-0 text-muted-foreground' />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search...'
              className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            />
          </div>
          <button
            onClick={openAdd}
            className='inline-flex shrink-0 h-10 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90'
          >
            <Plus className='h-4 w-4' />
            <span>Add Product</span>
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='h-10 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground outline-none'
          >
            <option value='all'>All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className='h-10 rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground outline-none'
          >
            <option value='all'>All Stock</option>
            <option value='in'>In Stock</option>
            <option value='out'>Out of Stock</option>
          </select>
          <ViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      {view === 'table' ? (
        <DashPanel noPadding>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-border/40 bg-surface/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-3'>Products</th>
                  <th className='px-5 py-3'>Category</th>
                  <th className='px-5 py-3'>Brand</th>
                  <th className='px-5 py-3'>Price</th>
                  <th className='px-5 py-3'>Stock</th>
                  <th className='px-5 py-3'>Available</th>
                  <th className='px-5 py-3'>Created At</th>
                  <th className='px-5 py-3'></th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-5 py-12 text-center text-sm text-muted-foreground'
                    >
                      No products found.
                    </td>
                  </tr>
                )}
                {paginated.map((p: any) => (
                  <tr
                    key={p.id}
                    className='border-b border-border/30 transition hover:bg-surface/50'
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-surface'>
                          <Image
                            src={p.images?.[0] || '/placeholder.svg'}
                            alt={p.name}
                            fill
                            className='object-contain p-1'
                            unoptimized
                          />
                        </div>
                        <span className='font-medium text-foreground'>{p.name}</span>
                      </div>
                    </td>
                    <td className='px-5 py-3.5 text-muted-foreground'>
                      {p.categoryName || p.categorySlug || '-'}
                    </td>
                    <td className='px-5 py-3.5 text-muted-foreground'>{p.brand || '-'}</td>
                    <td className='px-5 py-3.5 font-medium text-foreground'>
                      {formatBDT(p.price || 0)}
                    </td>
                    <td className='px-5 py-3.5'>
                      <span
                        className={cx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          p.stock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600',
                        )}
                      >
                        {p.stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className='px-5 py-3.5'>
                      <button
                        type='button'
                        onClick={() => handleToggle(p.id, 'availability', !p.availability)}
                        disabled={toggleMutation.isPending}
                        className={cx(
                          'inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50',
                          p.availability ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                        )}
                        title={p.availability ? 'Available for purchase' : 'Hidden from storefront'}
                      >
                        <span
                          className={cx(
                            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
                            p.availability ? 'translate-x-5' : 'translate-x-0.5',
                          )}
                        />
                      </button>
                    </td>
                    <td className='px-5 py-3.5 text-muted-foreground'>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-1'>
                        <button
                          onClick={() => openView(p)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                        >
                          <Pencil className='h-4 w-4' />
                        </button>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.preventDefault();
                            if (copyingIdRef.current) return;
                            copyingIdRef.current = p.id;
                            copyMutation.mutate(p.id, {
                              onSettled: () => (copyingIdRef.current = null),
                            });
                          }}
                          disabled={copyMutation.isPending}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50'
                        >
                          <Copy className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleteMutation.isPending}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > rowsPerPage && (
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4'>
              <p className='text-xs text-muted-foreground'>
                Showing {(page - 1) * rowsPerPage + 1} to{' '}
                {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className='rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50'
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-8 rounded-lg text-sm font-medium transition ${page === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className='rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50'
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </DashPanel>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {paginated.length === 0 && (
              <div className='col-span-full rounded-xl border border-border/40 bg-card p-12 text-center text-sm text-muted-foreground'>
                No products found.
              </div>
            )}
            {paginated.map((p: any) => (
              <div
                key={p.id}
                className='group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition hover:border-primary/20 hover:shadow-md'
              >
                <div className='relative h-44 w-full overflow-hidden border-b border-border/30 bg-secondary/20'>
                  <Image
                    src={p.images?.[0] || '/placeholder.svg'}
                    alt={p.name}
                    fill
                    className='object-contain p-3 transition group-hover:scale-105'
                    unoptimized
                  />
                  <div className='absolute right-2 top-2 flex flex-col items-end gap-1.5'>
                    {p.stock ? (
                      <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 shadow-sm'>
                        In Stock
                      </span>
                    ) : (
                      <span className='rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm'>
                        Out of Stock
                      </span>
                    )}
                    {!p.availability && (
                      <span className='rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 shadow-sm'>
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
                <div className='flex flex-1 flex-col p-3.5'>
                  <p className='line-clamp-2 text-sm font-semibold text-foreground'>{p.name}</p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>{p.brand || 'No Brand'}</p>
                  <p className='mt-0.5 text-[11px] text-muted-foreground'>
                    {p.categoryName || p.categorySlug || 'Uncategorized'}
                  </p>
                  <div className='mt-2 flex items-center justify-between'>
                    <span className='text-sm font-bold text-foreground'>
                      {formatBDT(p.price || 0)}
                    </span>
                    {p.discount > 0 && (
                      <span className='rounded bg-accent/10 px-1.5 py-px text-[10px] font-semibold text-accent'>
                        -{p.discount}%
                      </span>
                    )}
                  </div>
                  <div className='mt-3 flex items-center justify-between rounded-lg border border-border/40 px-2.5 py-1.5'>
                    <span className='text-[11px] font-medium text-muted-foreground'>Available</span>
                    <button
                      type='button'
                      onClick={() => handleToggle(p.id, 'availability', !p.availability)}
                      disabled={toggleMutation.isPending}
                      className={cx(
                        'inline-flex h-5 w-9 items-center rounded-full transition disabled:opacity-50',
                        p.availability ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                      )}
                      title={p.availability ? 'Available for purchase' : 'Hidden from storefront'}
                    >
                      <span
                        className={cx(
                          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition',
                          p.availability ? 'translate-x-4' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </div>
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => openView(p)}
                      className='flex h-8 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white'
                    >
                      <Eye className='h-3.5 w-3.5' />
                      View
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className='flex h-8 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white'
                    >
                      <Pencil className='h-3.5 w-3.5' />
                      Edit
                    </button>
                  </div>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.preventDefault();
                        if (copyingIdRef.current) return;
                        copyingIdRef.current = p.id;
                        copyMutation.mutate(p.id, {
                          onSettled: () => (copyingIdRef.current = null),
                        });
                      }}
                      disabled={copyMutation.isPending}
                      className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border/40 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50'
                    >
                      <Copy className='h-3.5 w-3.5' />
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleteMutation.isPending}
                      className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-200/40 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length > rowsPerPage && (
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/40 bg-card p-4'>
              <p className='text-xs text-muted-foreground'>
                Showing {(page - 1) * rowsPerPage + 1} to{' '}
                {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
              </p>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className='rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50'
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-8 rounded-lg text-sm font-medium transition ${page === p ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className='rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary disabled:opacity-50'
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <ProductEditDialog
        productId={editProductId}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />

      <ProductViewDialog
        productId={viewProductId}
        open={showViewModal}
        onOpenChange={setShowViewModal}
      />
    </DashPage>
  );
}
