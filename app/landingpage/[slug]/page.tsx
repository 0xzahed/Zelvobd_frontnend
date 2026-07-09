import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/src/api/_shared/client';
import LandingPageTemplate from './LandingPageTemplate';

async function getLandingPage(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/landing-pages/slug/${slug}`, {
      cache: 'no-store'
    });
    const payload = await res.json();
    if (!res.ok || payload?.status === false || !payload.data) {
      return null;
    }
    return payload.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const page = await getLandingPage(resolvedParams.slug);
  if (!page) return { title: 'Not Found' };
  
  return {
    title: page.heroSection?.title || 'Landing Page',
    description: page.heroSection?.subtitle || '',
  };
}

export default async function LandingPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const pageData = await getLandingPage(resolvedParams.slug);

  if (!pageData) {
    notFound();
  }

  return <LandingPageTemplate data={pageData} />;
}
