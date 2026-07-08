'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useLandingPages, useDeleteLandingPage } from '@/src/hooks/api/useLandingPages';
import { AdminPage, AdminPageHeader, AdminPrimaryButton } from '@/components/admin/admin-ui';
import { useConfirm } from '@/components/ui/confirm-dialog';

export default function LandingPagesList() {
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

  return (
    <AdminPage>
      <AdminPageHeader
        title='Landing Pages (Funnels)'
        actions={
          <Link href="/admin/landing-pages/new" passHref>
            <AdminPrimaryButton disabled={isLimitReached} className={isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}>
              <Plus className='mr-2 h-4 w-4' />
              Create New
            </AdminPrimaryButton>
          </Link>
        }
      />
      {isLimitReached && (
        <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200">
          You have reached the maximum limit of 5 landing pages. You must delete an existing page to create a new one.
        </div>
      )}

      <div className='mt-6 overflow-hidden rounded-xl border border-border bg-background shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='border-b border-border bg-secondary/50 text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium'>Slug</th>
                <th className='px-4 py-3 font-medium'>Color Palette</th>
                <th className='px-4 py-3 font-medium text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className='px-4 py-8 text-center text-muted-foreground'>
                    Loading landing pages...
                  </td>
                </tr>
              ) : landingPages?.length === 0 ? (
                <tr>
                  <td colSpan={3} className='px-4 py-8 text-center text-muted-foreground'>
                    No landing pages found. Click "Create New" to add one.
                  </td>
                </tr>
              ) : (
                landingPages?.map((page) => (
                  <tr key={page.id} className='transition-colors hover:bg-secondary/20'>
                    <td className='px-4 py-3 font-medium'>/{page.slug}</td>
                    <td className='px-4 py-3'>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize bg-secondary">
                        {page.colorPalette || 'Blue'}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <a
                          href={`/landingpage/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className='grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-white'
                          title="View"
                        >
                          <Eye className='h-4 w-4' />
                        </a>
                        <Link
                          href={`/admin/landing-pages/${page.id}/edit`}
                          className='grid h-8 w-8 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-white'
                          title="Edit"
                        >
                          <Pencil className='h-4 w-4' />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id!, page.slug)}
                          className='grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent transition hover:bg-accent hover:text-white'
                          title="Delete"
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPage>
  );
}
