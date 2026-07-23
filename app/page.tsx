'use client';

import { CategoriesSection } from '@/components/home/categories-section';
import { FreeDeliveryBanner } from '@/components/home/free-delivery-banner';
import { TrendingSection } from '@/components/home/trending-section';
import { AppShell } from '@/components/layout/app-shell';
import { SliderBannerSkeleton } from '@/components/ui/skeletons/slider-banner-skeleton';
import { useSliders } from '@/lib/use-store-data';
import { useHomePageBanners } from '@/src/hooks/api/useBanners';
import dynamic from 'next/dynamic';

const SliderBanner = dynamic(
  () => import('@/components/ui/slider-banner').then((m) => ({ default: m.SliderBanner })),
  { ssr: false, loading: SliderBannerSkeleton },
);
const CategoryProductsSections = dynamic(
  () =>
    import('@/components/home/category-products-sections').then((m) => ({
      default: m.CategoryProductsSections,
    })),
  { ssr: false },
);
const YoutubeVideoSection = dynamic(
  () =>
    import('@/components/home/youtube-video-section').then((m) => ({
      default: m.YoutubeVideoSection,
    })),
  { ssr: false },
);
const FloatingRotatingIcon = dynamic(
  () =>
    import('@/components/home/floating-rotating-icon').then((m) => ({
      default: m.FloatingRotatingIcon,
    })),
  { ssr: false },
);

export default function HomePage() {
  const { data: sliders } = useHomePageBanners();
  const { loaded } = useSliders(); // keeping temporarily for other dependencies if any

  return (
    <AppShell>
      <div className='space-y-5 py-4 md:space-y-8 md:py-4'>
        <SliderBanner slides={sliders || []} />
        <CategoriesSection />
        {/* <FlashSaleSection /> */}
        <FreeDeliveryBanner />
        <TrendingSection />
        <CategoryProductsSections />
        <YoutubeVideoSection />
      </div>
      <FloatingRotatingIcon />
    </AppShell>
  );
}
