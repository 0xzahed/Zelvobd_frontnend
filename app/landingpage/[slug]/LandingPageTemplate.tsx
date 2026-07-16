'use client';

import React, { useState, useEffect, useMemo } from 'react';
import localFont from 'next/font/local';
import {
  Wallet,
  RotateCcw,
  BadgeCheck,
  Truck,
  Flame,
  Droplets,
  RefreshCw,
  Infinity as InfinityIcon,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Utensils,
  CookingPot,
  Soup,
  ChefHat,
  Coffee,
  Brush,
  Feather,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toAbsoluteUploadUrl } from '@/src/api/mainApi';
import LandingPageCheckoutForm from './LandingPageCheckoutForm';
import { SiteFooter } from '@/components/layout/site-footer';
import { SliderBanner } from '@/components/ui/slider-banner';
import './landing-page.css';

const googleSans = localFont({
  src: '../../../public/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf',
  variable: '--font-google-sans',
  display: 'swap',
});

// Icon Mapping
const IconMap: Record<string, any> = {
  flame: Flame,
  droplets: Droplets,
  refresh: RefreshCw,
  infinity: InfinityIcon,
  utensils: Utensils,
  pot: CookingPot,
  soup: Soup,
  chef: ChefHat,
  coffee: Coffee,
  brush: Brush,
  feather: Feather,
  check: Check,
  truck: Truck,
  shield: Shield,
  wallet: Wallet,
  rotate: RotateCcw,
  badge: BadgeCheck,
};

export const bnDigits = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

// Palette configurations mapped to CSS Variables
const THEMES: Record<string, any> = {
  blue: {
    '--lp-background': '#fdfbf7',
    '--lp-navy': '#1e1b4b',
    '--lp-navy-foreground': '#ffffff',
    '--lp-cta': '#ea580c',
    '--lp-cta-foreground': '#ffffff',
    '--lp-highlight': '#fef08a',
    '--lp-highlight-foreground': '#422006',
    '--lp-info': '#0284c7',
    '--lp-success': '#16a34a',
    '--lp-border': '#e5e7eb',
    '--lp-card': '#ffffff',
    '--lp-foreground': '#1c1c1e',
    '--lp-shadow-card': '0 6px 24px -12px rgba(0,0,0,0.18)',
    '--lp-shadow-cta': '0 10px 28px -10px rgba(234, 88, 12, 0.55)',
    '--lp-gradient-cta': 'linear-gradient(180deg, #f97316, #ea580c)',
  },
  green: {
    '--lp-background': '#f0fdf4',
    '--lp-navy': '#064e3b',
    '--lp-navy-foreground': '#ffffff',
    '--lp-cta': '#22c55e',
    '--lp-cta-foreground': '#ffffff',
    '--lp-highlight': '#dcfce7',
    '--lp-highlight-foreground': '#064e3b',
    '--lp-info': '#0284c7',
    '--lp-success': '#16a34a',
    '--lp-border': '#bbf7d0',
    '--lp-card': '#ffffff',
    '--lp-foreground': '#1c1c1e',
    '--lp-shadow-card': '0 6px 24px -12px rgba(0,0,0,0.18)',
    '--lp-shadow-cta': '0 10px 28px -10px rgba(34, 197, 94, 0.55)',
    '--lp-gradient-cta': 'linear-gradient(180deg, #4ade80, #22c55e)',
  },
  red: {
    '--lp-background': '#fef2f2',
    '--lp-navy': '#450a0a',
    '--lp-navy-foreground': '#ffffff',
    '--lp-cta': '#ef4444',
    '--lp-cta-foreground': '#ffffff',
    '--lp-highlight': '#fee2e2',
    '--lp-highlight-foreground': '#450a0a',
    '--lp-info': '#0284c7',
    '--lp-success': '#16a34a',
    '--lp-border': '#fecaca',
    '--lp-card': '#ffffff',
    '--lp-foreground': '#1c1c1e',
    '--lp-shadow-card': '0 6px 24px -12px rgba(0,0,0,0.18)',
    '--lp-shadow-cta': '0 10px 28px -10px rgba(239, 68, 68, 0.55)',
    '--lp-gradient-cta': 'linear-gradient(180deg, #f87171, #ef4444)',
  },
  purple: {
    '--lp-background': '#faf5ff',
    '--lp-navy': '#3b0764',
    '--lp-navy-foreground': '#ffffff',
    '--lp-cta': '#a855f7',
    '--lp-cta-foreground': '#ffffff',
    '--lp-highlight': '#f3e8ff',
    '--lp-highlight-foreground': '#3b0764',
    '--lp-info': '#0284c7',
    '--lp-success': '#16a34a',
    '--lp-border': '#e9d5ff',
    '--lp-card': '#ffffff',
    '--lp-foreground': '#1c1c1e',
    '--lp-shadow-card': '0 6px 24px -12px rgba(0,0,0,0.18)',
    '--lp-shadow-cta': '0 10px 28px -10px rgba(168, 85, 247, 0.55)',
    '--lp-gradient-cta': 'linear-gradient(180deg, #c084fc, #a855f7)',
  },
  orange: {
    '--lp-background': '#fff7ed',
    '--lp-navy': '#431407',
    '--lp-navy-foreground': '#ffffff',
    '--lp-cta': '#f97316',
    '--lp-cta-foreground': '#ffffff',
    '--lp-highlight': '#ffedd5',
    '--lp-highlight-foreground': '#431407',
    '--lp-info': '#0284c7',
    '--lp-success': '#16a34a',
    '--lp-border': '#fed7aa',
    '--lp-card': '#ffffff',
    '--lp-foreground': '#1c1c1e',
    '--lp-shadow-card': '0 6px 24px -12px rgba(0,0,0,0.18)',
    '--lp-shadow-cta': '0 10px 28px -10px rgba(249, 115, 22, 0.55)',
    '--lp-gradient-cta': 'linear-gradient(180deg, #fb923c, #f97316)',
  },
};

/* ---------- countdown ---------- */
function useCountdown(targetDateTimeStr?: string) {
  const [now, setNow] = useState(() => Date.now());

  const targetMs = useMemo(() => {
    if (targetDateTimeStr) {
      const ms = new Date(targetDateTimeStr).getTime();
      if (!isNaN(ms)) return ms;
    }
    return Date.now() + 8 * 86400000 + 1 * 3600000 + 21 * 60000;
  }, [targetDateTimeStr]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return { d, h, m, s };
}

/* ---------- primitives ---------- */
function CtaButton({ children, href = '#order' }: { children: React.ReactNode; href?: string }) {
  return (
    <div className='w-full flex justify-center'>
      <a href={href} className='btn-cta shiny-button'>
        {children} <ArrowRight size={20} />
      </a>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className='pill-highlight'>{children}</span>;
}

function SectionHeader({
  pill,
  title,
  subtitle,
}: {
  pill?: string;
  title?: string;
  subtitle?: string;
}) {
  if (!title && !pill && !subtitle) return null;
  return (
    <div className='text-center mb-5 sm:mb-8'>
      {pill && (
        <div className='mb-2 flex justify-center'>
          <Pill>{pill}</Pill>
        </div>
      )}
      {title && (
        <h2
          className='text-2xl sm:text-3xl md:text-4xl font-bold'
          style={{ color: 'var(--lp-navy)' }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className='mt-2 text-sm sm:text-base opacity-80 max-w-2xl mx-auto px-4'
          style={{ color: 'var(--lp-foreground)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------- primitives ---------- */
function getYouTubeEmbedUrl(url: string) {
  if (!url) return '';
  let videoId = '';
  try {
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
    }
  } catch (e) { }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export default function LandingPageTemplate({ data }: { data: any }) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const themeVariables = THEMES[data.colorPalette || 'blue'] || THEMES['blue'];

  const hero = data.heroSection || {};
  const table = data.tableSection || {};
  const featureCards = data.featureCards || [];
  const video = data.videoSection || {};
  const bullets = data.bulletPointsSection || {};
  const tips = data.tipsSection || {};
  const faq = data.faqSection || {};
  const checkout = data.checkoutSection || {};
  const whatsapp = data.whatsappSection || {};

  const { d, h, m, s } = useCountdown(data.timerSection?.targetDateTime);

  const box = (v: number, l: string) => (
    <div
      className='rounded-xl px-3 py-2.5 sm:px-5 sm:py-3 min-w-16 sm:min-w-22.5 text-center'
      style={{ backgroundColor: 'var(--lp-navy)', color: 'var(--lp-navy-foreground)' }}
    >
      <div className='text-2xl sm:text-4xl font-bold leading-none tabular-nums'>
        {bnDigits(String(v).padStart(2, '0'))}
      </div>
      <div className='text-[10px] sm:text-xs mt-1 opacity-80'>{l}</div>
    </div>
  );

  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <div
      className={`landing-page-wrapper min-h-screen pb-24 md:pb-0 ${googleSans.variable}`}
      style={themeVariables}
    >
      {/* Hero Section */}
      <section className='py-3'>
        <div className='mx-auto max-w-6xl px-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-center md:gap-6'>
          <div className='text-center md:text-left'>
            {hero.caption && (
              <div className='mb-2 flex justify-center md:justify-start'>
                <Pill>{hero.caption}</Pill>
              </div>
            )}
            {hero.title && (
              <h1
                className='text-3xl sm:text-4xl md:text-5xl font-bold leading-tight'
                style={{ color: 'var(--lp-navy)' }}
              >
                {hero.title.split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </h1>
            )}
            {hero.subtitle && (
              <p className='mt-2 text-base sm:text-lg opacity-80'>{hero.subtitle}</p>
            )}
          </div>

          {hero.image && (
            <div>
              <div
                className='relative rounded-2xl overflow-hidden bg-white shadow-md'
                style={{ boxShadow: 'var(--lp-shadow-card)' }}
              >
                <img
                  src={toAbsoluteUploadUrl(hero.image)}
                  alt='Hero Image'
                  className='w-full h-auto object-cover'
                />
              </div>
            </div>
          )}

          <div className='md:col-span-2 flex flex-col items-center md:items-start gap-2'>
            {hero.regularPrice && (
              <div className='flex items-baseline gap-2'>
                <span className='opacity-70 line-through text-lg'>
                  নিয়মিত মূল্য {bnDigits(hero.regularPrice)}৳
                </span>
              </div>
            )}
            {hero.offerPrice && (
              <div className='flex items-baseline gap-2'>
                <span
                  className='text-2xl sm:text-3xl font-bold'
                  style={{ color: 'var(--lp-info)' }}
                >
                  অফার মূল্য :
                </span>
                <span
                  className='text-4xl sm:text-5xl font-extrabold'
                  style={{ color: 'var(--lp-info)' }}
                >
                  {bnDigits(hero.offerPrice)}৳
                </span>
              </div>
            )}
            {hero.regularPrice && hero.offerPrice && Number(hero.regularPrice) > Number(hero.offerPrice) && (
              <p className='text-sm font-semibold' style={{ color: 'var(--lp-success)' }}>
                সাশ্রয় {bnDigits(Number(hero.regularPrice) - Number(hero.offerPrice))}৳ + ফ্রি ডেলিভারি
              </p>
            )}
            <div className='mt-1'>
              <CtaButton>{hero.buttonText || 'অর্ডার করুন'}</CtaButton>
            </div>
          </div>
        </div>
      </section>
      {/* Banner Slider */}
      {data.sliderSection?.images && data.sliderSection.images.length > 0 && data.sliderSection.images[0]?.url && (
        <section className='py-3' style={{ backgroundColor: 'var(--lp-background)' }}>
          <div className='mx-auto max-w-5xl px-4'>
            <SliderBanner slides={data.sliderSection.images.map((img: any, i: number) => ({
              id: String(i),
              image: toAbsoluteUploadUrl(img.url),
              link: '#',
              title: `Banner ${i}`
            }))} />
          </div>
        </section>
      )}
      {/* Table Section */}
      {table.tableData && table.tableData.length > 0 && table.tableData[0]?.key && (
        <section className='py-3' style={{ backgroundColor: 'var(--lp-background)' }}>
          <div className='mx-auto max-w-3xl px-4'>
            <SectionHeader pill={table.caption} title={table.title} subtitle={table.subtitle} />

            <div className='card-soft p-0 overflow-hidden'>
              <ul className='divide-y' style={{ borderColor: 'var(--lp-border)' }}>
                {table.tableData.map((row: any, i: number) => {
                  const IconC = IconMap[row.icon || 'check'] || Check;
                  return (
                    <li
                      key={i}
                      className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:px-5'
                    >
                      <div className='min-w-0 flex items-center gap-2'>
                        <span
                          className='text-sm sm:text-base truncate'
                          style={{ color: 'var(--lp-navy)' }}
                        >
                          {row.key}
                        </span>
                      </div>
                      <span
                        className='shrink-0 text-sm font-bold'
                        style={{ color: 'var(--lp-info)' }}
                      >
                        {row.value}
                      </span>
                    </li>
                  );
                })}
                {table.totalItemsKey && table.totalItemsValue && (
                  <li className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 sm:px-5' style={{ backgroundColor: 'var(--lp-highlight)' }}>
                    <span className='font-bold text-sm sm:text-base' style={{ color: 'var(--lp-navy)' }}>{table.totalItemsKey}</span>
                    <span className='font-bold text-sm sm:text-base tabular-nums' style={{ color: 'var(--lp-navy)' }}>{table.totalItemsValue}</span>
                  </li>
                )}
                {table.offerPriceKey && table.offerPriceValue && (
                  <li className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5' style={{ backgroundColor: 'var(--lp-navy)', color: 'var(--lp-navy-foreground)' }}>
                    <span className='font-bold text-sm sm:text-base'>{table.offerPriceKey}</span>
                    <span className='text-2xl font-extrabold tabular-nums'>{table.offerPriceValue}</span>
                  </li>
                )}
              </ul>
            </div>
            {table.buttonText && (
              <div className='mt-4 flex justify-center'>
                <CtaButton>{table.buttonText}</CtaButton>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feature Cards (Dynamic Trust Bar) */}
      {featureCards && featureCards.length > 0 && featureCards[0]?.title && (
        <section className='py-3 border-y' style={{ borderColor: 'var(--lp-border)' }}>
          <div className='mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            {featureCards.map((card: any, idx: number) => {
              // Dynamically get the icon component from Lucide React
              const IconC = (LucideIcons as any)[card.icon] || Check;
              return (
                <div key={idx} className='flex flex-col items-center gap-2'>
                  <div
                    className='w-12 h-12 rounded-full grid place-items-center'
                    style={{ backgroundColor: 'var(--lp-highlight)', color: 'var(--lp-cta)' }}
                  >
                    <IconC size={24} />
                  </div>
                  <div className='text-sm sm:text-base font-semibold' style={{ color: 'var(--lp-navy)' }}>
                    {card.title}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Countdown Timer */}
      <section className='py-3'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <div className='flex justify-center gap-2 sm:gap-3'>
            {box(d, 'দিন')}
            {box(h, 'ঘন্টা')}
            {box(m, 'মিনিট')}
            {box(s, 'সেকেন্ড')}
          </div>
          <p className='mt-1 text-sm sm:text-base font-semibold' style={{ color: 'var(--lp-cta)' }}>
            ⚡ অফার শেষ হওয়ার আগেই অর্ডার করুন
          </p>
        </div>
      </section>


      {/* Video Section */}
      {(video.videoLink || video.cards?.length > 0) && (
        <section className='py-3' style={{ backgroundColor: 'var(--lp-background)' }}>
          <div className='mx-auto max-w-6xl px-4'>

            {/* Caption */}
            {video.caption && (
              <div className='text-center mb-5 sm:mb-8'>
                <div className='mb-2 flex justify-center'>
                  <Pill>{video.caption}</Pill>
                </div>
              </div>
            )}

            {/* Video */}
            {video.videoLink && (
              <div className='mx-auto mb-6 sm:mb-8 w-full max-w-3xl'>
                <div
                  className='relative w-full overflow-hidden rounded-2xl bg-black'
                  style={{ aspectRatio: '16 / 9', boxShadow: 'var(--lp-shadow-card)' }}
                >
                  {video.customThumbnail && !isVideoPlaying ? (
                    <div
                      className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      <img src={toAbsoluteUploadUrl(video.customThumbnail)} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                      <div className="relative z-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <LucideIcons.Play className="text-white w-8 h-8 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      className='absolute inset-0 h-full w-full'
                      src={(() => {
                        const embedUrl = getYouTubeEmbedUrl(video.videoLink);
                        return video.customThumbnail
                          ? (embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`)
                          : embedUrl;
                      })()}
                      title='Video'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}

            {/* Cards */}
            {video.cards && video.cards.length > 0 && video.cards[0]?.title && (
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {video.cards.map((c: any, i: number) => {
                  const IconC = (LucideIcons as any)[c.icon] || Check;
                  return (
                    <div key={i} className='card-soft p-5 flex flex-col items-start gap-3'>
                      <div
                        className='w-12 h-12 rounded-full grid place-items-center'
                        style={{ backgroundColor: 'var(--lp-highlight)', color: 'var(--lp-cta)' }}
                      >
                        <IconC size={24} />
                      </div>
                      <h3 className='text-lg font-bold' style={{ color: 'var(--lp-navy)' }}>
                        {c.title}
                      </h3>
                      {c.subtitle && (
                        <p className='text-sm leading-relaxed opacity-80'>
                          {c.subtitle}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </section>
      )}

      {/* Bullet Points */}
      {bullets.points && bullets.points.length > 0 && bullets.points[0]?.value && (
        <section className='py-3'>
          <div className='mx-auto max-w-3xl px-4 text-center flex flex-col items-center'>

            {/* The Image */}
            {bullets.image && (
              <div className='rounded-2xl overflow-hidden bg-white w-full max-w-xl' style={{ boxShadow: 'var(--lp-shadow-card)' }}>
                <img
                  src={toAbsoluteUploadUrl(bullets.image)}
                  alt={bullets.title || 'Feature Image'}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* The Text Block */}
            <div className={`${bullets.image ? 'mt-5' : ''} flex flex-col items-center`}>
              {bullets.caption && <Pill>{bullets.caption}</Pill>}

              {bullets.title && (
                <h2
                  className='mt-2 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight'
                  style={{ color: 'var(--lp-navy)' }}
                >
                  {bullets.title}
                </h2>
              )}

              {bullets.subtitle && (
                <p className='mt-2 text-sm sm:text-base opacity-80 max-w-2xl'>
                  {bullets.subtitle}
                </p>
              )}

              <ul className='mt-3 space-y-1.5 text-sm sm:text-base inline-block text-left'>
                {bullets.points.map((pt: any, idx: number) => (
                  <li key={idx} className='flex gap-2 font-medium'>
                    <span style={{ color: 'var(--lp-success)' }}>✔</span> {pt.value}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>
      )}

      {/* Care Tip */}
      {tips.title && (
        <section className='py-3'>
          <div className='mx-auto max-w-3xl px-4'>
            <div
              className='rounded-2xl p-4 sm:p-5'
              style={{
                backgroundColor: 'var(--lp-highlight)',
                color: 'var(--lp-highlight-foreground)',
              }}
            >
              <div className='flex items-start gap-3'>
                <span
                  className='shrink-0 w-10 h-10 rounded-full bg-white/70 grid place-items-center'
                  style={{ color: 'var(--lp-cta)' }}
                >
                  {(() => {
                    const TipIcon = tips.icon ? ((LucideIcons as any)[tips.icon] || Lightbulb) : Lightbulb;
                    return <TipIcon size={22} />;
                  })()}
                </span>
                <div className='min-w-0'>
                  <h3 className='font-bold text-lg' style={{ color: 'var(--lp-navy)' }}>
                    {tips.title}
                  </h3>
                  {tips.subtitle && (
                    <p className='mt-2 text-sm sm:text-base leading-relaxed'>{tips.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Checkout Section */}
      <section
        id='order'
        className='py-3'
        style={{ backgroundColor: 'var(--lp-navy)', color: 'var(--lp-navy-foreground)' }}
      >
        <div className='mx-auto max-w-2xl px-4'>
          <div className='text-center mb-5'>
            {checkout.caption && (
              <div className='mb-2 flex justify-center'>
                <Pill>{checkout.caption}</Pill>
              </div>
            )}
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white'>
              {checkout.title || 'অর্ডার ফর্ম'}
            </h2>
            {checkout.subtitle && (
              <p className='mt-2 text-sm sm:text-base opacity-80 text-white/80'>
                {checkout.subtitle}
              </p>
            )}
          </div>

          <div
            className='rounded-2xl p-5 sm:p-7 shadow-md'
            style={{
              backgroundColor: 'var(--lp-card)',
              color: 'var(--lp-foreground)',
              boxShadow: 'var(--lp-shadow-card)',
            }}
          >
            <div
              className='mb-5 flex items-center justify-between gap-3 rounded-xl border p-3'
              style={{ borderColor: 'var(--lp-border)' }}
            >
              <div className='min-w-0'>
                <div
                  className='font-semibold text-sm sm:text-base truncate'
                  style={{ color: 'var(--lp-navy)' }}
                >
                  {checkout.productName || 'Your Product'}
                </div>
                {checkout.subName && (
                  <div className='text-xs sm:text-sm opacity-70'>{checkout.subName}</div>
                )}
              </div>
              {checkout.price && (
                <div
                  className='shrink-0 text-lg sm:text-xl font-extrabold tabular-nums'
                  style={{ color: 'var(--lp-info)' }}
                >
                  {bnDigits(checkout.price)}৳
                </div>
              )}
            </div>

            <LandingPageCheckoutForm landingPage={data} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faq.qas && faq.qas.length > 0 && faq.qas[0]?.question && (
        <section className='py-3'>
          <div className='mx-auto max-w-3xl px-4'>
            <SectionHeader pill={faq.caption} title={faq.title} />
            <div className='card-soft p-0 overflow-hidden'>
              <ul className='divide-y' style={{ borderColor: 'var(--lp-border)' }}>
                {faq.qas.map((f: any, i: number) => {
                  const isOpen = faqOpen === i;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => setFaqOpen(isOpen ? null : i)}
                        className='w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:px-5 text-left'
                        aria-expanded={isOpen}
                      >
                        <span
                          className='font-semibold text-sm sm:text-base'
                          style={{ color: 'var(--lp-navy)' }}
                        >
                          {f.question}
                        </span>
                        <span
                          className='shrink-0 text-xl font-bold w-6 text-center'
                          style={{ color: 'var(--lp-cta)' }}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen && (
                        <div className='px-4 pb-4 sm:px-5 text-sm sm:text-base opacity-80 leading-relaxed'>
                          {f.answer}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile CTA */}
      <div
        className='fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur border-t px-3 py-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center'
        style={{ borderColor: 'var(--lp-border)', boxShadow: '0 -6px 20px -10px oklch(0.2 0.03 260 / 0.25)' }}
      >
        <div className='min-w-0'>
          <div className='text-xs opacity-70'>অফার মূল্য</div>
          <div
            className='text-lg font-extrabold leading-none tabular-nums'
            style={{ color: 'var(--lp-info)' }}
          >
            {hero.offerPrice ? `${bnDigits(hero.offerPrice)}৳` : 'অফার'}
            {hero.regularPrice && (
              <span className='text-xs opacity-60 line-through font-normal ml-1'>
                {bnDigits(hero.regularPrice)}৳
              </span>
            )}
          </div>
        </div>
        <div className='flex justify-center'>
          <a href='#order' className='btn-cta shiny-button py-2! px-3! text-sm'>
            অর্ডার করুন <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* WhatsApp Float */}
      {whatsapp.phoneNumber && (
        <a
          href={`https://wa.me/${whatsapp.phoneNumber}?text=${encodeURIComponent(whatsapp.prefilledMessage || '')}`}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='WhatsApp'
          className='fixed z-50 right-4 bottom-24 md:bottom-6 grid place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white hover:scale-105 transition-transform shadow-lg'
          style={{ boxShadow: '0 10px 30px -8px rgba(37,211,102,0.6)' }}
        >
          <MessageCircle size={28} />
        </a>
      )}

      {/* Main Website Footer */}
      <SiteFooter />
    </div>
  );
}

