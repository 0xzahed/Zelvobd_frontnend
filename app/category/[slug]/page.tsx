'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCategories } from '@/lib/use-store-data';
import type { Slider, SubCategory } from '@/lib/types';
import { AppShell } from '@/components/layout/app-shell';
import { BackHeader } from '@/components/layout/back-header';
import { SubCategoryCard } from '@/components/ui/category-card';
import { SliderBanner } from '@/components/ui/slider-banner';
import { SubCategoryProductsSections } from '@/components/category/sub-category-products-sections';
import { getBannersByCategory } from '@/src/api/bannerApi';
import { getCategoryBannersPublic } from '@/src/api/categoryBannerApi';
import { getSubCategories } from '@/src/api/categoryApi';
import { mapBanner, mapSubCategory } from '@/src/api/mainApi';
import { CategoryBannerSlider } from '@/components/category/category-banner-slider';
import type { CategoryBanner } from '@/lib/types';
import { FloatingRotatingIcon } from '@/components/home/floating-rotating-icon';
import { ProductSliderSkeleton } from '@/components/ui/skeletons/product-slider-skeleton';

export default function CategoryPage(props: { params: any }) {
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    if (props.params && typeof props.params.then === 'function') {
      props.params.then((res: any) => setSlug(res.slug));
    } else if (props.params) {
      setSlug(props.params.slug);
    }
  }, [props.params]);

  const { categories, loaded: catsLoaded } = useCategories();

  const [categorySlides, setCategorySlides] = useState<Slider[]>([]);
  const [newCategoryBanners, setNewCategoryBanners] = useState<CategoryBanner[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [pageDataLoaded, setPageDataLoaded] = useState(false);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(null);

  const category = slug ? categories.find((c) => c.slug === slug) : undefined;

  useEffect(() => {
    if (!catsLoaded || !slug) return;
    if (!category) {
      setPageDataLoaded(true);
      return;
    }

    let cancelled = false;
    const loadData = async () => {
      try {
        const [bannersRes, newBannersRes, subsRes] = await Promise.all([
          getBannersByCategory(category.id).catch(() => null),
          getCategoryBannersPublic(category.id).catch(() => null),
          getSubCategories({ categoryId: category.id, limit: 100 }).catch(() => null),
        ]);

        if (!cancelled) {
          setCategorySlides((bannersRes?.data || []).map(mapBanner));
          setNewCategoryBanners(newBannersRes?.data || []);
          setSubCategories((subsRes?.data?.subCategories || []).map(mapSubCategory));
          setPageDataLoaded(true);
        }
      } catch (err) {
        if (!cancelled) setPageDataLoaded(true);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [category, catsLoaded, slug]);

  // Don't render until we have the slug and data
  if (!slug) {
    return (
      <AppShell>
        <div className='flex min-h-[50vh] items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        </div>
      </AppShell>
    );
  }

  const loaded = catsLoaded && pageDataLoaded;

  if (!loaded) {
    return (
      <AppShell>
        <BackHeader title="" />
        <div className='py-4 md:py-6 space-y-6'>
          <div className='h-8 w-48 rounded bg-muted/60 animate-pulse' />
          <div className='flex gap-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-7 w-20 rounded-full bg-muted/60 animate-pulse' />
            ))}
          </div>
          <div className='flex gap-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-16 w-24 rounded-lg bg-muted/60 animate-pulse shrink-0' />
            ))}
          </div>
          <ProductSliderSkeleton title="" />
          <ProductSliderSkeleton title="" />
        </div>
      </AppShell>
    );
  }

  if (!category) return notFound();

  const orderedSubCategories = activeSubCategoryId 
    ? [
        ...subCategories.filter(sc => sc.id === activeSubCategoryId),
        ...subCategories.filter(sc => sc.id !== activeSubCategoryId)
      ]
    : subCategories;

  return (
    <AppShell>
      <BackHeader title={category.name} />
      <div className='space-y-5 py-4 md:space-y-6 md:py-6'>
        {newCategoryBanners.length > 0 && <CategoryBannerSlider banners={newCategoryBanners} />}

        {/* Sub-categories */}
        {subCategories.length > 0 && (
          <section className='space-y-4'>
            {/* Text Buttons Row */}
            <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
              {subCategories.map((sc) => (
                <button
                  key={`text-${sc.id}`}
                  onClick={() => setActiveSubCategoryId(sc.id)}
                  className={`whitespace-nowrap flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 border border-[#6C95E9] px-4 h-7 ${activeSubCategoryId === sc.id ? 'bg-[#052F84] text-white border-transparent' : 'text-[#6C95E9] bg-[#EBF1FD] hover:border-transparent hover:text-white hover:bg-[linear-gradient(45deg,#052F84,#7BA4F7)]'}`}
                >
                  {sc.name}
                </button>
              ))}
            </div>

            {/* Images Row */}
            <div className='flex gap-3 overflow-x-auto no-scrollbar pb-2'>
              {subCategories.map((sc) => (
                <button
                  key={`img-${sc.id}`}
                  onClick={() => setActiveSubCategoryId(sc.id)}
                  className={`relative shrink-0 h-16 overflow-hidden rounded-lg border bg-card transition-transform duration-300 hover:scale-105 hover:shadow-sm block ${activeSubCategoryId === sc.id ? 'border-primary ring-2 ring-primary/50' : 'border-border/50 hover:border-primary'}`}
                >
                  {sc.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={sc.image} alt={sc.name} className='h-full w-auto object-cover' />
                  ) : (
                    <div className='h-full w-24 bg-secondary/50 flex items-center justify-center'>
                      <span className='text-[10px] text-muted-foreground'>No Image</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Products by Subcategory */}
        {orderedSubCategories.length > 0 && (
          <SubCategoryProductsSections 
            categorySlug={category.slug} 
            subCategories={orderedSubCategories} 
          />
        )}
      </div>
      <FloatingRotatingIcon />
    </AppShell>
  );
}
