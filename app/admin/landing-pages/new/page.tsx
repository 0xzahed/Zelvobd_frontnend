'use client';

import { useRouter } from 'next/navigation';
import { useCreateLandingPage } from '@/src/hooks/api/useLandingPages';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-ui';
import LandingPageForm from '@/components/admin/landing-pages/landing-page-form';

export default function NewLandingPage() {
  const router = useRouter();
  const createMutation = useCreateLandingPage();

  const handleSubmit = (data: any) => {
    // Sanitize productId if 'none' is selected
    if (data.productId === 'none' || data.productId === '') {
      delete data.productId;
    }
    
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/admin/landing-pages');
      }
    });
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title='Create New Landing Page'
        breadcrumbs={[
          { label: 'Landing Pages', href: '/admin/landing-pages' },
          { label: 'New', href: '/admin/landing-pages/new' },
        ]}
      />
      
      <div className="mt-6">
        <LandingPageForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
      </div>
    </AdminPage>
  );
}
