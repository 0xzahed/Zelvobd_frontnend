'use client';

import { useRouter } from 'next/navigation';
import { useCreateLandingPage } from '@/src/hooks/api/useLandingPages';
import { DashPage, DashHeader } from '@/dashboard/components/dash-ui';
import LandingPageForm from '@/components/admin/landing-pages/landing-page-form';

export default function NewLandingPage() {
  const router = useRouter();
  const createMutation = useCreateLandingPage();

  const handleSubmit = (data: any) => {
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
    <DashPage>
      <DashHeader
        title='Create New Landing Page'
      />

      <div className="mt-6">
        <LandingPageForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
      </div>
    </DashPage>
  );
}
