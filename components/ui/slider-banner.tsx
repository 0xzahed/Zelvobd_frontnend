'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Slider } from '@/lib/types';

import 'swiper/css';
import 'swiper/css/pagination';

export function SliderBanner({ slides }: { slides: Slider[] }) {
  if (slides.length === 0) return null;

  return (
    <div className='banner-swiper relative w-full overflow-hidden rounded-xl'>
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        autoplay={
          slides.length > 1
            ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={{ clickable: true }}
        className='w-full'
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <Link
              href={slide.link || '#'}
              className='block w-full'
              aria-label={slide.title || 'Banner'}
            >
              <div className='relative aspect-2/1 w-full overflow-hidden bg-[#f5f5f7] md:aspect-16/5'>
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.title || 'Banner'}
                    fill
                    priority={index === 0}
                    sizes='(max-width: 768px) 100vw, 100vw'
                    className='object-cover'
                    draggable={false}
                  />
                ) : (
                  <div
                    aria-hidden
                    className='absolute inset-0'
                    style={{
                      background: `linear-gradient(120deg, ${slide.bg}, ${slide.bg}cc 60%, #1a1a2e 120%)`,
                    }}
                  />
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
