'use client';

import type { CategoryBanner } from '@/lib/types';
import { toAbsoluteUploadUrl } from '@/src/api/mainApi';
import Image from 'next/image';
import Link from 'next/link';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

export function CategoryBannerSlider({ banners }: { banners: CategoryBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <div className='banner-swiper relative w-full overflow-hidden rounded-xl'>
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={banners.length > 1}
        autoplay={
          banners.length > 1
            ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={{ clickable: true }}
        className='w-full'
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.id}>
            <Link
              href={banner.url || '#'}
              className='block w-full'
              aria-label={banner.title || 'Category Banner'}
            >
              <div className='relative aspect-4/1 w-full overflow-hidden bg-[#f5f5f7]'>
                {banner.imageUrl ? (
                  <Image
                    src={toAbsoluteUploadUrl(banner.imageUrl)}
                    alt={banner.title || 'Category Banner'}
                    fill
                    priority={index === 0}
                    sizes='100vw'
                    className='object-cover'
                    draggable={false}
                  />
                ) : (
                  <div className='absolute inset-0 bg-primary/10' />
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
