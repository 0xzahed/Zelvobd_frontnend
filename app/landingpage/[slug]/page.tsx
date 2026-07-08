import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BASE_URL } from '@/src/api/_shared/client';
import LandingPageTemplate from './LandingPageTemplate';

async function getLandingPage(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/landing-pages/slug/${slug}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getLandingPage(params.slug);
  if (!page) return { title: 'Not Found' };
  
  return {
    title: page.heroSection?.title || 'Landing Page',
    description: page.heroSection?.subtitle || '',
  };
}

export default async function LandingPageRoute({ params }: { params: { slug: string } }) {
  const pageData = await getLandingPage(params.slug);

  if (!pageData) {
    notFound();
  }

  return <LandingPageTemplate data={pageData} />;
}
