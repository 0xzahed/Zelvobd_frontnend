'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Link2, Pencil, Plus, Trash2, X, Youtube } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { notify } from '@/lib/notify';
import { AdminPage, AdminPageHeader, AdminPrimaryButton } from '@/components/admin/admin-ui';
import {
  useYoutubeVideos,
  useCreateYoutubeVideo,
  useUpdateYoutubeVideo,
  useDeleteYoutubeVideo,
  type YoutubeVideoType,
} from '@/src/hooks/api/useYoutubeVideos';
import { toAbsoluteUrl } from '@/lib/api-utils';

type Draft = {
  id?: string;
  title: string;
  url: string;
  image: string;
};

const emptyDraft: Draft = { title: '', url: '', image: '' };

export default function AdminYoutubeVideos() {
  const { data: videos = [], isLoading } = useYoutubeVideos();
  const createMutation = useCreateYoutubeVideo();
  const updateMutation = useUpdateYoutubeVideo();
  const deleteMutation = useDeleteYoutubeVideo();

  const confirm = useConfirm();

  const handleDelete = async (v: YoutubeVideoType) => {
    const ok = await confirm({
      title: 'Delete video?',
      message: `Are you sure you want to delete "${v.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(v.id);
  };

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const editing = Boolean(draft.id);

  const openCreate = () => {
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (v: YoutubeVideoType) => {
    setDraft({
      id: v.id,
      title: v.title || '',
      url: v.url || '',
      image: v.imageUrl ? toAbsoluteUrl(v.imageUrl) : '',
    });
    setOpen(true);
  };

  const handleImagePick = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result ?? '') }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editing && !draft.image) {
      notify.error({ title: 'Validation Error', message: 'Please upload a thumbnail.' });
      return;
    }

    if (editing && draft.id) {
      updateMutation.mutate(
        {
          id: draft.id,
          title: draft.title,
          url: draft.url,
          image: draft.image,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setDraft(emptyDraft);
          },
        },
      );
    } else {
      createMutation.mutate(
        {
          title: draft.title,
          url: draft.url,
          image: draft.image,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setDraft(emptyDraft);
          },
        },
      );
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title='YouTube Videos'
        count={`${videos.length} total`}
        actions={
          <AdminPrimaryButton onClick={openCreate}>
            <Plus className='h-4 w-4' /> Add Video
          </AdminPrimaryButton>
        }
      />

      {/* Cards */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {isLoading ? (
          <div className='col-span-full rounded-sm border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground'>
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className='col-span-full rounded-sm border border-border/40 bg-card p-10 text-center text-sm text-muted-foreground'>
            No videos added yet.
          </div>
        ) : (
          videos.map((v: YoutubeVideoType) => (
            <div
              key={v.id}
              className='flex flex-col rounded-sm border border-border/40 bg-card shadow-sm transition hover:bg-secondary/30 overflow-hidden'
            >
              <div className='relative w-full aspect-video overflow-hidden bg-surface'>
                {v.imageUrl ? (
                  <Image
                    src={toAbsoluteUrl(v.imageUrl)}
                    alt={v.title}
                    fill
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='absolute inset-0 grid place-items-center bg-secondary/50'>
                    <Youtube className='h-8 w-8 text-muted-foreground/30' />
                  </div>
                )}
              </div>
              <div className='flex min-w-0 flex-1 flex-col justify-between p-3 min-h-25'>
                <div>
                  <p className='line-clamp-2 text-sm font-semibold text-foreground' title={v.title}>
                    {v.title || 'Untitled'}
                  </p>
                  <a
                    href={v.url}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline'
                  >
                    <Link2 className='h-3 w-3' />
                    <span className='truncate'>{v.url}</span>
                  </a>
                </div>
                <div className='flex flex-nowrap gap-1 justify-end mt-3'>
                  <button
                    onClick={() => openEdit(v)}
                    aria-label='Edit'
                    className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-white'
                  >
                    <Pencil className='h-3.5 w-3.5' />
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    aria-label='Delete'
                    className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
            </div>
          ))
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
                {editing ? 'Edit Video' : 'Add New Video'}
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
              {/* Title */}
              <input
                type='text'
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder='Video Title'
                className='h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary'
                required
              />

              {/* URL */}
              <div className='flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3'>
                <Link2 className='h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder='YouTube URL (e.g., https://youtu.be/...)'
                  className='h-full w-full bg-transparent text-sm outline-none'
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <p className='mb-2 text-sm text-foreground'>Thumbnail Upload</p>
                <label className='block cursor-pointer'>
                  <input
                    type='file'
                    accept='image/*'
                    className='sr-only'
                    onChange={(e) => handleImagePick(e.target.files?.[0])}
                  />
                  <div className='relative grid min-h-35 place-items-center rounded-md border-2 border-dashed border-primary bg-secondary/60 p-4 transition hover:bg-secondary'>
                    {draft.image ? (
                      <div className='relative h-full w-full'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.image || '/placeholder.svg'}
                          alt='Preview'
                          className='mx-auto max-h-36 rounded-md object-contain'
                        />
                        <span className='mt-2 block text-center text-[11px] text-muted-foreground'>
                          Click to change thumbnail
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center gap-1 text-center'>
                        <ImagePlus className='h-6 w-6 text-primary' />
                        <span className='text-sm text-primary'>Click to upload thumbnail</span>
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
