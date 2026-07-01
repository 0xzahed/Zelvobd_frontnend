'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Link2, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { CategoryBanner } from '@/lib/types';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { AdminSelect } from '@/components/admin/admin-select';
import { notify } from '@/lib/notify';
import { AdminPage, AdminPageHeader, AdminPrimaryButton } from '@/components/admin/admin-ui';
import { useCategories } from '@/src/hooks/api/useCategories';
import {
  useCategoryBanners,
  useCreateCategoryBanner,
  useUpdateCategoryBanner,
  useDeleteCategoryBanner,
} from '@/src/hooks/api/useCategoryBanners';

type Draft = {
  id?: string;
  title: string;
  subTitle: string;
  url: string;
  imageUrl: string;
  categoryId: string;
};

const emptyDraft: Draft = {
  title: '',
  subTitle: '',
  url: '',
  imageUrl: '',
  categoryId: '',
};

export default function AdminCategoryBanners() {
  const { data: banners = [], isLoading: isLoadingBanners } = useCategoryBanners();
  const { data: categories = [] } = useCategories();

  const createMutation = useCreateCategoryBanner();
  const updateMutation = useUpdateCategoryBanner();
  const deleteMutation = useDeleteCategoryBanner();

  const confirm = useConfirm();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [file, setFile] = useState<File | null>(null);

  const handleImagePick = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      notify.error({ title: 'Error', message: 'Image must be less than 5MB' });
      return;
    }
    setFile(f);
    setDraft({ ...draft, imageUrl: URL.createObjectURL(f) });
  };

  const openNew = () => {
    setDraft(emptyDraft);
    setFile(null);
    setEditing(false);
    setOpen(true);
  };

  const openEdit = (b: CategoryBanner) => {
    setDraft({
      id: b.id,
      title: b.title,
      subTitle: b.subTitle || '',
      url: b.url || '',
      imageUrl: b.imageUrl,
      categoryId: b.categoryId,
    });
    setFile(null);
    setEditing(true);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!draft.title.trim()) {
      notify.error({ title: 'Error', message: 'Title is required' });
      return;
    }
    if (!draft.categoryId) {
      notify.error({ title: 'Error', message: 'Category is required' });
      return;
    }
    if (!editing && !file) {
      notify.error({ title: 'Error', message: 'Image is required' });
      return;
    }

    const formData = new FormData();
    formData.append('title', draft.title.trim());
    formData.append('categoryId', draft.categoryId);

    if (draft.subTitle.trim()) {
      formData.append('subTitle', draft.subTitle.trim());
    }
    if (draft.url.trim()) {
      formData.append('url', draft.url.trim());
    }
    if (file) {
      formData.append('image', file);
    }

    if (editing && draft.id) {
      updateMutation.mutate({ id: draft.id, formData }, { onSuccess: () => setOpen(false) });
    } else {
      createMutation.mutate(formData, { onSuccess: () => setOpen(false) });
    }
  };

  const handleDeleteBanner = async (b: CategoryBanner) => {
    const ok = await confirm({
      title: `Delete "${b.title}" banner?`,
      confirmText: 'Delete',
    });
    if (ok) {
      deleteMutation.mutate(b.id);
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title='Category Banners'
        actions={
          <AdminPrimaryButton onClick={openNew}>
            <Plus className='mr-2 h-4 w-4' />
            Add Banner
          </AdminPrimaryButton>
        }
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6'>
        {isLoadingBanners ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className='h-48 animate-pulse rounded-xl bg-muted' />
          ))
        ) : banners.length === 0 ? (
          <div className='col-span-full py-12 text-center'>
            <p className='text-sm text-muted-foreground'>No category banners found.</p>
          </div>
        ) : (
          banners.map((b) => {
            const categoryName =
              categories.find((c) => c.id === b.categoryId)?.name || 'Unknown Category';

            return (
              <div
                key={b.id}
                className='group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:shadow-md'
              >
                <div className='relative h-32 w-full bg-secondary overflow-hidden'>
                  {b.imageUrl && (
                    <Image
                      src={b.imageUrl || '/placeholder.svg'}
                      alt={b.title || 'Banner'}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
                      className='object-cover'
                      unoptimized
                    />
                  )}
                </div>
                <div className='flex min-w-0 flex-1 flex-col justify-between p-3 min-h-25'>
                  <div>
                    <p className='truncate text-sm font-semibold text-foreground'>{b.title}</p>
                    <p className='truncate text-xs text-muted-foreground mt-1'>
                      Category: {categoryName}
                    </p>
                  </div>
                  <div className='flex flex-nowrap gap-1 justify-end mt-2'>
                    <button
                      onClick={() => openEdit(b)}
                      aria-label='Edit'
                      className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-white'
                    >
                      <Pencil className='h-3.5 w-3.5' />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b)}
                      aria-label='Delete'
                      className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
          role='dialog'
          aria-modal='true'
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
          >
            <div className='relative mb-6 border-b border-border pb-3 text-center'>
              <h3 className='text-base text-foreground'>
                {editing ? 'Edit Category Banner' : 'Add New Category Banner'}
              </h3>
              <button
                type='button'
                aria-label='Close'
                onClick={() => setOpen(false)}
                className='absolute right-0 top-0 text-muted-foreground hover:text-foreground'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='space-y-4'>
              {/* Category */}
              <div>
                <AdminSelect
                  value={draft.categoryId}
                  onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                  disabled={categories.length === 0}
                >
                  <option value=''>Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </AdminSelect>
              </div>

              {/* Title */}
              <input
                type='text'
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder='Title'
                className='h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary'
                required
              />

              {/* Subtitle */}
              <input
                type='text'
                value={draft.subTitle}
                onChange={(e) => setDraft({ ...draft, subTitle: e.target.value })}
                placeholder='Sub Title (Optional)'
                className='h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary'
              />

              {/* Link */}
              <div className='flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3'>
                <Link2 className='h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder='Enter Link (Optional)'
                  className='h-full w-full bg-transparent text-sm outline-none'
                />
              </div>

              {/* Image Upload */}
              <div>
                <p className='mb-2 text-sm text-foreground'>Image Upload</p>
                <label className='block cursor-pointer'>
                  <input
                    type='file'
                    accept='image/*'
                    className='sr-only'
                    onChange={(e) => handleImagePick(e.target.files?.[0])}
                  />
                  <div className='relative grid min-h-35 place-items-center rounded-md border-2 border-dashed border-primary bg-secondary/60 p-4 transition hover:bg-secondary'>
                    {draft.imageUrl ? (
                      <div className='relative h-full w-full'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.imageUrl || '/placeholder.svg'}
                          alt='Preview'
                          className='mx-auto max-h-36 rounded-md object-contain'
                        />
                        <span className='mt-2 block text-center text-[11px] text-muted-foreground'>
                          Click to change image
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center gap-1 text-center'>
                        <ImagePlus className='h-6 w-6 text-primary' />
                        <span className='text-sm text-primary'>Click to upload image</span>
                        <span className='text-[11px] text-muted-foreground'>
                          Max image size 5 MB
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Submit */}
              <div className='flex justify-center pt-2'>
                <button
                  type='submit'
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className='inline-flex h-10 min-w-30 items-center justify-center rounded-md bg-primary px-6 text-sm text-white transition hover:bg-primary/90 disabled:opacity-70'
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Submitting...'
                    : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}
