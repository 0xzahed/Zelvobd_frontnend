'use client';

import { useRouter, useParams } from 'next/navigation';
import { useLandingPage, useUpdateLandingPage } from '@/src/hooks/api/useLandingPages';
import { DashPage, DashHeader, DashLoading } from '@/dashboard/components/dash-ui';
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
      <DashPage>
        <DashHeader title="Edit Landing Page" />
        <DashLoading label="Loading landing page data..." />
      </DashPage>
    );
  }

  if (!initialData) {
    return (
      <DashPage>
        <DashHeader title="Edit Landing Page" />
        <div className="flex h-40 items-center justify-center text-red-500 rounded-2xl border border-border/40 bg-card shadow-sm">
          Failed to load landing page.
        </div>
      </DashPage>
    );
  }

  return (
    <DashPage>
      <DashHeader
        title={`Edit Landing Page: /${initialData.slug}`}
      />

      <div className="mt-6">
        <LandingPageForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </DashPage>
  );
}
