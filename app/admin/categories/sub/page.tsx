'use client';

import { DashHeader, DashLoading, DashPage, DashPanel } from '@/dashboard/components/dash-ui';
import { ViewToggle, type ViewMode } from '@/dashboard/components/view-toggle';
import { formatRelativeTime } from '@/lib/format';
import {
  useCategories,
  useCreateSubCategory,
  useDeleteSubCategory,
  useUpdateSubCategory,
} from '@/src/hooks/api/useCategories';
import { getSubCategoryDetails } from '@/src/api/categoryApi';
import { handleApiError, toAbsoluteUrl } from '@/lib/api-utils';
import { Eye, ImagePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';

export default function DashboardSubCategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const deleteMutation = useDeleteSubCategory();
  const [q, setQ] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSub, setViewSub] = useState<any>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const subCategories = useMemo(() => {
    return categories.flatMap((c: any) =>
      (c.subCategories || []).map((sub: any) => ({
        ...sub,
        categoryName: c.name,
        categoryId: c.id,
      })),
    );
  }, [categories]);

  const filtered = useMemo(() => {
    const lc = q.toLowerCase().trim();
    if (!lc) return subCategories;
    return subCategories.filter((s: any) => s.name.toLowerCase().includes(lc));
  }, [subCategories, q]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const resetForm = () => {
    setName('');
    setImage('');
    setCategoryId('');
    setEditingSub(null);
  };

  const openAdd = () => {
    resetForm();
    if (categories.length > 0) setCategoryId(categories[0].id);
    setShowModal(true);
  };

  const openEdit = (sub: any) => {
    setEditingSub(sub);
    setName(sub.name);
    setImage(sub.image || '');
    setCategoryId(sub.categoryId);
    setShowModal(true);
  };

  const openView = async (sub: any) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewSub(null);
    try {
      const res = await getSubCategoryDetails(sub.id);
      const details = res?.data;
      if (!details?.id) throw new Error('Sub-category details not found');
      setViewSub({
        id: String(details.id),
        title: String(details.title || sub.name),
        slug: String(details.slug || sub.slug),
        categoryName: String(details.category?.name || sub.categoryName || '-'),
        imageUrl: toAbsoluteUrl(details.imageUrl || sub.image),
        createdAt: details.createdAt ? String(details.createdAt) : undefined,
        updatedAt: details.updatedAt ? String(details.updatedAt) : undefined,
      });
    } catch (error) {
      handleApiError(error, 'Failed to load sub-category');
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const pickImage = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    const n = name.trim();
    if (!n || !categoryId) return;
    if (editingSub) {
      updateMutation.mutate({
        categoryId,
        subId: editingSub.id,
        data: { name: n, image: image || undefined },
      });
    } else {
      createMutation.mutate({
        categoryId,
        sub: {
          id: `sub-${Date.now()}`,
          name: n,
          slug: n.toLowerCase().replace(/\s+/g, '-'),
          image: image || '/placeholder.svg',
        },
      });
    }
    closeModal();
  };

  const handleDelete = (sub: any) => {
    if (!window.confirm(`Delete "${sub.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ categoryId: sub.categoryId, subId: sub.id });
  };

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title='Sub Categories' subtitle='Manage your sub categories' />
        <DashLoading label='Loading sub categories...' />
      </DashPage>
    );
  }

  return (
    <DashPage>
      <DashHeader
        title='Sub Categories'
        subtitle='Manage your sub categories'
        actions={
          <button
            onClick={openAdd}
            className='inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90'
          >
            <Plus className='h-3.5 w-3.5' />
            Add Sub Category
          </button>
        }
      />

      {/* Search */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex h-10 min-w-0 max-w-xs items-center gap-2 rounded-lg border border-border/60 bg-card px-3'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search sub categories...'
            className='w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          />
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <DashPanel noPadding>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-border/40 bg-surface/50 text-muted-foreground'>
                  <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                    Sub Category
                  </th>
                  <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                    Parent Category
                  </th>
                  <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>Slug</th>
                  <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                    Created
                  </th>
                  <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-5 py-12 text-center text-sm text-muted-foreground'
                    >
                      No sub categories found.
                    </td>
                  </tr>
                )}
                {paginated.map((s: any) => (
                  <tr
                    key={s.id}
                    className='border-b border-border/30 transition hover:bg-surface/50'
                  >
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-surface'>
                          <Image
                            src={s.image || '/placeholder.svg'}
                            alt={s.name}
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>
                        <span className='font-medium text-foreground'>{s.name}</span>
                      </div>
                    </td>
                    <td className='px-5 py-3.5 text-muted-foreground'>{s.categoryName || '-'}</td>
                    <td className='px-5 py-3.5 text-muted-foreground'>/{s.slug}</td>
                    <td className='px-5 py-3.5 text-muted-foreground'>
                      {formatRelativeTime(s.createdAt)}
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-1'>
                        <button
                          onClick={() => void openView(s)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                        >
                          <Eye className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                        >
                          <Pencil className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500'
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
        </DashPanel>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filtered.length === 0 && (
            <div className='col-span-full rounded-xl border border-border/40 bg-card p-12 text-center text-sm text-muted-foreground'>
              No sub categories found.
            </div>
          )}
          {paginated.map((s: any) => (
            <div
              key={s.id}
              className='group flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card transition hover:border-primary/20 hover:shadow-md'
            >
              <div className='relative h-40 w-full overflow-hidden bg-white'>
                <Image
                  src={s.image || '/placeholder.svg'}
                  alt={s.name}
                  fill
                  className='object-contain p-2 transition group-hover:scale-105'
                  unoptimized
                />
                <div className='absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm'>
                  {s.categoryName || '-'}
                </div>
              </div>
              <div className='flex flex-1 flex-col p-3.5'>
                <p className='text-sm font-semibold text-foreground'>{s.name}</p>
                <p className='mt-0.5 text-xs text-muted-foreground'>/{s.slug}</p>
                <p className='mt-2 text-xs text-muted-foreground'>
                  Created {formatRelativeTime(s.createdAt)}
                </p>
                <div className='mt-3 grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => void openView(s)}
                    className='flex h-8 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white'
                  >
                    <Eye className='h-3.5 w-3.5' />
                    View
                  </button>
                  <button
                    onClick={() => openEdit(s)}
                    className='flex h-8 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white'
                  >
                    <Pencil className='h-3.5 w-3.5' />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
          role='dialog'
          aria-modal='true'
          onClick={closeModal}
        >
          <div
            className='relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              aria-label='Close'
              onClick={closeModal}
              className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
            <h3 className='text-center text-base font-bold text-foreground'>
              {editingSub ? 'Edit Sub Category' : 'Add New Sub Category'}
            </h3>
            <div className='mx-auto mt-4 h-px w-full bg-border/60' />

            <div className='mt-5'>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Parent Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className='h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40'
              >
                <option value=''>Select a category</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-4'>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Sub category name'
                className='h-10 w-full rounded-lg border border-border/60 bg-card px-3 text-sm outline-none focus:border-primary/40'
              />
            </div>

            <div className='mt-4'>
              <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Image Upload
              </label>
              <input
                ref={imgInputRef}
                type='file'
                accept='image/*'
                className='sr-only'
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
              <button
                type='button'
                onClick={() => imgInputRef.current?.click()}
                className='flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-secondary/30 py-6 text-center transition hover:bg-secondary'
              >
                {image ? (
                  <img
                    src={image || '/placeholder.svg'}
                    alt='Preview'
                    className='mx-auto max-h-28 rounded-lg object-contain'
                  />
                ) : (
                  <>
                    <ImagePlus className='h-6 w-6 text-primary' />
                    <span className='text-sm text-primary'>Click to upload image</span>
                    <span className='text-[11px] text-muted-foreground'>Max size 5 MB</span>
                  </>
                )}
              </button>
            </div>

            <div className='mt-6 flex justify-center'>
              <button
                onClick={submit}
                disabled={
                  !name.trim() ||
                  !categoryId ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
                className='inline-flex h-10 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {createMutation.isPending || updateMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOpen && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
          role='dialog'
          aria-modal='true'
          onClick={() => setViewOpen(false)}
        >
          <div
            className='relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              aria-label='Close'
              onClick={() => setViewOpen(false)}
              className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'
            >
              <X className='h-4 w-4' />
            </button>
            <h3 className='text-center text-base font-bold text-foreground'>Sub Category Details</h3>
            <div className='mx-auto mt-4 h-px w-full bg-border/60' />

            {viewLoading && (
              <p className='py-10 text-center text-sm text-muted-foreground'>Loading details...</p>
            )}

            {!viewLoading && viewSub && (
              <div className='mt-5 space-y-4'>
                <div className='mx-auto h-36 w-36 overflow-hidden rounded-xl border border-border/60 bg-secondary'>
                  <img
                    src={viewSub.imageUrl || '/placeholder.svg'}
                    alt={viewSub.title}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div className='space-y-2 rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm'>
                  <p className='text-foreground'>
                    <span className='mr-2 font-semibold'>Title:</span>
                    {viewSub.title}
                  </p>
                  <p className='text-foreground'>
                    <span className='mr-2 font-semibold'>Slug:</span>/{viewSub.slug}
                  </p>
                  <p className='text-foreground'>
                    <span className='mr-2 font-semibold'>Parent Category:</span>
                    {viewSub.categoryName}
                  </p>
                  <p className='text-muted-foreground'>
                    <span className='mr-2 font-semibold text-foreground'>Created:</span>
                    {viewSub.createdAt
                      ? new Date(viewSub.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                  <p className='text-muted-foreground'>
                    <span className='mr-2 font-semibold text-foreground'>Updated:</span>
                    {viewSub.updatedAt
                      ? new Date(viewSub.updatedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashPage>
  );
}
