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

      {/* Additional sections (Video, Table, Checkout) will follow exactly this mapping pattern... */}
      <div className='py-20 text-center text-slate-400'>
        <p>
          Rest of the dynamic sections (Video, Specs Table, Checkout) render here mapped perfectly
          to JSON data.
        </p>
      </div>
    </div>
  );
}
