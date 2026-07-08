'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLandingPage, useUpdateLandingPage } from '@/src/hooks/api/useLandingPages';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-ui';
import LandingPageForm from '@/components/admin/landing-pages/landing-page-form';

export default function EditLandingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: initialData, isLoading } = useLandingPage(id);
  const updateMutation = useUpdateLandingPage();

  const handleSubmit = (data: any) => {
    if (data.productId === 'none' || data.productId === '') {
      data.productId = null;
    }
    
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        router.push('/admin/landing-pages');
      }
    });
  };

  if (isLoading) {
    return (
      <AdminPage>
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          Loading landing page data...
        </div>
      </AdminPage>
    );
  }

  if (!initialData) {
    return (
      <AdminPage>
        <div className="flex h-40 items-center justify-center text-red-500">
          Failed to load landing page.
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={`Edit Landing Page: /${initialData.slug}`}
      />
      
      <div className="mt-6">
        <LandingPageForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isSubmitting={updateMutation.isPending} 
        />
      </div>
    </AdminPage>
  );
}
