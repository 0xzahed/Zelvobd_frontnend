'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useLandingPages, useDeleteLandingPage } from '@/src/hooks/api/useLandingPages';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { DashPage, DashHeader, DashPanel, DashLoading, DashEmptyState } from '@/dashboard/components/dash-ui';

export default function DashboardLandingPages() {
  const { data: landingPages, isLoading } = useLandingPages();
  const deleteMutation = useDeleteLandingPage();
  const confirm = useConfirm();

  const handleDelete = async (id: string, slug: string) => {
    const ok = await confirm({
      title: `Delete landing page "${slug}"?`,
      confirmText: 'Delete',
    });
    if (ok) {
      deleteMutation.mutate(id);
    }
  };

  const isLimitReached = landingPages && landingPages.length >= 5;

  if (isLoading) {
    return (
      <DashPage>
        <DashHeader title="Landing Pages (Funnels)" />
        <DashLoading label="Loading landing pages..." />
      </DashPage>
    );
  }

  return (
    <DashPage>
      <DashHeader
        title='Landing Pages (Funnels)'
        actions={
          <Link href="/admin/landing-pages/new" passHref>
            <button
              disabled={isLimitReached}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className='h-3.5 w-3.5' />
              Create New
            </button>
          </Link>
        }
      />

      {isLimitReached && (
        <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200">
          You have reached the maximum limit of 5 landing pages. You must delete an existing page to create a new one.
        </div>
      )}

      {(!landingPages || landingPages.length === 0) ? (
        <DashEmptyState
          title="No landing pages found"
          description='Click "Create New" to add one.'
        />
      ) : (
        <DashPanel noPadding>
          <div className="overflow-x-auto">
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-border/40 bg-surface/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-3'>Slug</th>
                  <th className='px-5 py-3'>Color Palette</th>
                  <th className='px-5 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30'>
                {landingPages?.map((page: any) => (
                  <tr key={page.id} className='transition-colors hover:bg-surface/50'>
                    <td className='px-5 py-3.5 font-medium'>/{page.slug}</td>
                    <td className='px-5 py-3.5'>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-secondary">
                        {page.colorPalette || 'Blue'}
                      </span>
                    </td>
                    <td className='px-5 py-3.5 text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <a
                          href={`/landingpage/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                          title="View"
                        >
                          <Eye className='h-4 w-4' />
                        </a>
                        <Link
                          href={`/admin/landing-pages/${page.id}/edit`}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground'
                          title="Edit"
                        >
                          <Pencil className='h-4 w-4' />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id!, page.slug)}
                          className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500'
                          title="Delete"
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
      )}
    </DashPage>
  );
}
