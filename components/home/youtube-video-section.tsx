'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Play, X } from 'lucide-react';
import { useStorefrontYoutubeVideos } from '@/lib/use-store-data';
import { toAbsoluteUrl } from '@/lib/api-utils';
import 'swiper/css';
import 'swiper/css/pagination';

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/,
  );
  return match ? match[1] : null;
}

export function YoutubeVideoSection() {
  const { videos, loaded } = useStorefrontYoutubeVideos();
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (loaded && videos.length === 0) return null;

  return (
    <section className='bg-surface px-4 py-4 md:px-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-bold text-foreground'>Featured Videos</h2>
      </div>

      {!loaded ? (
        <div className='h-48 w-full animate-pulse rounded-xl bg-secondary md:h-80'></div>
      ) : (
        <div className='banner-swiper relative w-full overflow-hidden rounded-xl'>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={0}
            loop={videos.length > 1}
            autoplay={
              videos.length > 1
                ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }
                : false
            }
            pagination={{ clickable: true }}
            className='w-full'
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <div
                  className='group relative aspect-2/1 w-full cursor-pointer overflow-hidden bg-[#f5f5f7] md:aspect-16/5'
                  onClick={() => {
                    const videoId = getYouTubeId(video.url);
                    if (videoId) {
                      setActiveVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
                    } else {
                      window.open(video.url, '_blank');
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  aria-label={`Play ${video.title}`}
                >
                  {video.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={toAbsoluteUrl(video.imageUrl)}
                      alt={video.title}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      draggable={false}
                    />
                  ) : (
                    <div className='absolute inset-0 bg-secondary/80' />
                  )}

                  {/* Overlay */}
                  <div className='absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40' />

                  {/* Play Button */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110'>
                      <Play className='ml-1 h-6 w-6 text-red-600' fill='currentColor' />
                    </div>
                  </div>

                  {/* Title */}
                  <div className='absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pb-8 md:pb-10'>
                    <h3 className='line-clamp-2 text-base font-medium text-white md:text-xl'>
                      {video.title}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Video Modal */}
      {activeVideoUrl && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm'
          onClick={() => setActiveVideoUrl(null)}
        >
          <div className='relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl'>
            <button
              onClick={() => setActiveVideoUrl(null)}
              className='absolute -right-2 -top-2 z-10 m-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40 backdrop-blur-md'
              aria-label='Close video'
            >
              <X className='h-5 w-5' />
            </button>
            <iframe
              src={activeVideoUrl}
              title='YouTube video player'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
              className='absolute inset-0 h-full w-full border-0'
            ></iframe>
          </div>
        </div>
      )}
    </section>
  );
}
