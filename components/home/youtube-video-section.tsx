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
    <section className='px-4 py-4 md:px-6'>
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

                  {/* Bottom gradient */}
                  <div className='absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent' />

                  {/* Play Button with radiating rings */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='relative flex h-12 w-12 items-center justify-center'>
                      {/* Pulse rings */}
                      <div className='animate-ring absolute inset-0 rounded-full border-2 border-blue-400/60' />
                      <div className='animate-ring-delayed absolute inset-0 rounded-full border-2 border-blue-400/40' />
                      {/* Button */}
                      <div className='animate-glow relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg shadow-blue-500/40 transition-transform group-hover:scale-110'>
                        <Play className='ml-1 h-5 w-5 text-[#6C95E9]' fill='currentColor' />
                      </div>
                    </div>
                  </div>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Video Modal */}
      <GlowStyles />
      {activeVideoUrl && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-lg'
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

function GlowStyles() {
  return (
    <style>{`
      @keyframes glow-pulse {
        0%, 100% { 
          box-shadow: 0 4px 16px rgba(108,149,233,0.6), 0 8px 32px rgba(108,149,233,0.4), 0 12px 48px rgba(108,149,233,0.2);
        }
        50% { 
          box-shadow: 0 4px 24px rgba(108,149,233,0.9), 0 8px 48px rgba(108,149,233,0.6), 0 16px 64px rgba(108,149,233,0.35);
        }
      }
      .animate-glow {
        animation: glow-pulse 2.5s ease-in-out infinite;
      }
      @keyframes ring-expand {
        0% {
          transform: scale(1);
          opacity: 0.7;
        }
        100% {
          transform: scale(2.2);
          opacity: 0;
        }
      }
      .animate-ring {
        animation: ring-expand 2s ease-out infinite;
      }
      .animate-ring-delayed {
        animation: ring-expand 2s ease-out infinite;
        animation-delay: 1s;
      }
    `}</style>
  );
}
