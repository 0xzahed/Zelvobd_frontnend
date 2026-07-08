'use client';

import React from 'react';
import { Hind_Siliguri } from 'next/font/google';
import {
  Flame,
  Droplets,
  RefreshCw,
  Infinity as InfinityIcon,
  Utensils,
  CookingPot,
  Soup,
  ChefHat,
  Coffee,
  Brush,
  Feather,
  Check,
  Truck,
  Shield,
} from 'lucide-react';
import { toAbsoluteUploadUrl } from '@/src/api/_shared/mappers';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// A mapping of lucide icons from strings
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
};

const bnDigits = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

// Palette configurations mapped to CSS Variables
const THEMES: Record<string, any> = {
  blue: {
    '--lp-bg': '#f0f9ff',
    '--lp-navy': '#0f172a',
    '--lp-cta': '#3b82f6',
    '--lp-cta-hover': '#2563eb',
    '--lp-highlight': '#dbeafe',
  },
  green: {
    '--lp-bg': '#f0fdf4',
    '--lp-navy': '#064e3b',
    '--lp-cta': '#22c55e',
    '--lp-cta-hover': '#16a34a',
    '--lp-highlight': '#dcfce7',
  },
  red: {
    '--lp-bg': '#fef2f2',
    '--lp-navy': '#450a0a',
    '--lp-cta': '#ef4444',
    '--lp-cta-hover': '#dc2626',
    '--lp-highlight': '#fee2e2',
  },
  purple: {
    '--lp-bg': '#faf5ff',
    '--lp-navy': '#3b0764',
    '--lp-cta': '#a855f7',
    '--lp-cta-hover': '#9333ea',
    '--lp-highlight': '#f3e8ff',
  },
  orange: {
    '--lp-bg': '#fff7ed',
    '--lp-navy': '#431407',
    '--lp-cta': '#f97316',
    '--lp-cta-hover': '#ea580c',
    '--lp-highlight': '#ffedd5',
  },
};

export default function LandingPageTemplate({ data }: { data: any }) {
  const themeVariables = THEMES[data.colorPalette || 'blue'] || THEMES['blue'];

  const hero = data.heroSection || {};
  const table = data.tableSection || {};
  const featureCards = data.featureCards || [];
  const video = data.videoSection || {};
  const bullets = data.bulletPointsSection || {};
  const faq = data.faqSection || {};

  return (
    <div
      className={`${hindSiliguri.className} min-h-screen text-slate-800`}
      style={{ ...themeVariables, backgroundColor: 'var(--lp-bg)' } as React.CSSProperties}
    >
      {/* Hero Section */}
      <section className='py-8 px-4 max-w-4xl mx-auto'>
        <div className='flex flex-col md:flex-row gap-8 items-center bg-white rounded-3xl p-6 shadow-sm border border-slate-100'>
          <div className='w-full md:w-1/2'>
            {hero.image && (
              <img
                src={toAbsoluteUploadUrl(hero.image)}
                alt={hero.title}
                className='w-full h-auto rounded-2xl object-cover'
              />
            )}
          </div>
          <div className='w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4'>
            {hero.caption && (
              <span className='bg-(--lp-highlight) text-(--lp-cta) px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide'>
                {hero.caption}
              </span>
            )}
            <h1 className='text-3xl md:text-4xl font-bold text-(--lp-navy) leading-tight'>
              {hero.title}
            </h1>
            <p className='text-slate-500 text-lg'>{hero.subtitle}</p>
            <div className='flex items-center gap-4 mt-2'>
              {hero.regularPrice && (
                <span className='text-xl text-slate-400 line-through decoration-red-500'>
                  ৳ {bnDigits(hero.regularPrice)}
                </span>
              )}
              <span className='text-3xl font-bold text-(--lp-cta)'>
                ৳ {bnDigits(hero.offerPrice || '0')}
              </span>
            </div>
            <button
              className='w-full mt-4 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1'
              style={{ backgroundColor: 'var(--lp-cta)' }}
            >
              {hero.buttonText || 'Order Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      {featureCards.length > 0 && (
        <section className='py-8 px-4 max-w-4xl mx-auto'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {featureCards.map((card: any, idx: number) => {
              const Icon = IconMap[card.icon?.toLowerCase()] || Check;
              return (
                <div
                  key={idx}
                  className='bg-white p-4 rounded-2xl flex flex-col items-center text-center shadow-sm border border-slate-100'
                >
                  <div className='w-12 h-12 rounded-full mb-3 flex items-center justify-center bg-(--lp-highlight) text-(--lp-cta)'>
                    <Icon size={24} />
                  </div>
                  <h3 className='font-semibold text-slate-700'>{card.title}</h3>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Video & Features Showcase */}
      {video.videoLink && (
        <section className='py-12 px-4 max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            {video.caption && (
              <span className='inline-block bg-(--lp-highlight) text-(--lp-cta) px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4'>
                {video.caption}
              </span>
            )}
            <h2 className='text-2xl md:text-4xl font-bold text-(--lp-navy)'>
              {video.title || 'ভিডিও রিভিউ'}
            </h2>
          </div>

          <div className='w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-black relative mb-12'>
            <iframe
              className='absolute inset-0 h-full w-full'
              src={video.videoLink.replace('watch?v=', 'embed/')}
              title='Video Review'
              allowFullScreen
            />
          </div>

          {video.cards && video.cards.length > 0 && (
            <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center'>
              <ul className='text-left space-y-4 inline-block'>
                {video.cards.map((card: any, idx: number) => {
                  const Icon = IconMap[card.icon?.toLowerCase()] || Check;
                  return (
                    <li key={idx} className='flex gap-3 text-lg md:text-xl'>
                      <span className='text-(--lp-cta) mt-1'>
                        <Icon size={24} />
                      </span>
                      <span className='font-semibold text-slate-700'>
                        {card.title}{' '}
                        <span className='font-normal text-slate-500'>{card.subtitle}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              {video.cards[0]?.image && (
                <img
                  src={toAbsoluteUploadUrl(video.cards[0].image)}
                  className='mt-8 rounded-2xl w-full'
                />
              )}
            </div>
          )}
        </section>
      )}

      {/* Specifications Table */}
      {table.tableData && table.tableData.length > 0 && (
        <section className='py-12 px-4 max-w-3xl mx-auto'>
          <div className='text-center mb-8'>
            {table.caption && (
              <span className='inline-block bg-[var(--lp-highlight)] text-(--lp-cta) px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4'>
                {table.caption}
              </span>
            )}
            <h2 className='text-2xl md:text-4xl font-bold text-(--lp-navy)'>{table.title}</h2>
            <p className='text-slate-500 mt-2'>{table.subtitle}</p>
          </div>

          <div className='bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100'>
            <ul className='divide-y divide-slate-100'>
              {table.tableData.map((row: any, idx: number) => (
                <li key={idx} className='flex justify-between items-center px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <span className='w-10 h-10 rounded-full bg-(--lp-highlight) text-[var(--lp-cta)] flex items-center justify-center'>
                      <Check size={20} />
                    </span>
                    <span className='font-semibold text-slate-800 text-lg'>{row.key}</span>
                  </div>
                  <span className='font-bold text-[var(--lp-cta)] text-lg'>{row.value}</span>
                </li>
              ))}
              {table.bottomRows && (
                <li className='bg-[var(--lp-navy)] text-white px-6 py-5 text-center font-bold text-xl'>
                  {table.bottomRows}
                </li>
              )}
            </ul>
          </div>
          <div className='mt-8 flex justify-center'>
            <button
              className='px-12 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1'
              style={{ backgroundColor: 'var(--lp-cta)' }}
            >
              {table.buttonText || 'Order Now'}
            </button>
          </div>
        </section>
      )}

      {/* Bullet Points Section */}
      {bullets.points && bullets.points.length > 0 && (
        <section className='py-12 px-4 max-w-4xl mx-auto border-t border-slate-200'>
          <div className='text-center mb-8'>
            {bullets.caption && (
              <span className='inline-block bg-[var(--lp-highlight)] text-[var(--lp-cta)] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4'>
                {bullets.caption}
              </span>
            )}
            <h2 className='text-2xl md:text-3xl font-bold text-[var(--lp-navy)]'>
              {bullets.title}
            </h2>
          </div>
          <div className='bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100'>
            <ul className='grid md:grid-cols-2 gap-4'>
              {bullets.points.map((pt: any, idx: number) => (
                <li key={idx} className='flex gap-3 bg-[var(--lp-highlight)] p-4 rounded-xl'>
                  <Check className='text-[var(--lp-cta)] shrink-0' size={24} />
                  <span className='text-slate-700 font-medium'>{pt.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faq.qas && faq.qas.length > 0 && (
        <section className='py-12 px-4 max-w-3xl mx-auto'>
          <div className='text-center mb-8'>
            {faq.caption && (
              <span className='inline-block bg-[var(--lp-highlight)] text-[var(--lp-cta)] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4'>
                {faq.caption}
              </span>
            )}
            <h2 className='text-2xl md:text-4xl font-bold text-[var(--lp-navy)]'>{faq.title}</h2>
          </div>
          <div className='bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100'>
            <ul className='divide-y divide-slate-100'>
              {faq.qas.map((qa: any, idx: number) => (
                <li key={idx} className='group'>
                  <details className='w-full cursor-pointer p-6 bg-white hover:bg-slate-50 transition-colors'>
                    <summary className='font-semibold text-lg text-[var(--lp-navy)] flex justify-between items-center list-none'>
                      {qa.question}
                      <span className='text-[var(--lp-cta)] text-2xl group-open:rotate-45 transition-transform'>
                        +
                      </span>
                    </summary>
                    <p className='mt-4 text-slate-500 leading-relaxed pl-2 border-l-2 border-[var(--lp-cta)]'>
                      {qa.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Checkout Form Placeholder for Phase 4 */}
      <section className='py-16 px-4' style={{ backgroundColor: 'var(--lp-navy)' }}>
        <div className='max-w-2xl mx-auto text-center text-white'>
          <h2 className='text-3xl font-bold mb-8'>Order Form (Phase 4 Logic Goes Here)</h2>
          <div className='bg-white rounded-3xl p-8 text-slate-800 shadow-xl'>
            <p>
              The Bengali phone number sanitization and API submission logic will be integrated into
              this container.
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      {data.whatsappSection?.phoneNumber && (
        <a
          href={`https://wa.me/${data.whatsappSection.phoneNumber}?text=${encodeURIComponent(data.whatsappSection.prefilledMessage || '')}`}
          target='_blank'
          rel='noreferrer'
          className='fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center'
        >
          <svg viewBox='0 0 24 24' fill='currentColor' className='w-8 h-8'>
            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
          </svg>
        </a>
      )}
    </div>
  );
}
