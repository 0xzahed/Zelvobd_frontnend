'use client';

import React, { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { BASE_URL } from '@/src/api/_shared/client';
import { bnDigits } from './LandingPageTemplate'; // Assuming exported or re-implemented

const convertToEnglishDigits = (str: string) => {
  const map: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return str.replace(/[০-৯]/g, (match) => map[match]);
};

export default function LandingPageCheckoutForm({
  landingPageId,
  checkoutData,
}: {
  landingPageId: string;
  checkoutData: any;
}) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const subtotal = Number(checkoutData.price || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const englishPhone = convertToEnglishDigits(form.phone).replace(/\s/g, '');
    if (!englishPhone.match(/^01[3-9]\d{8}$/)) {
      setError('Please provide a valid 11-digit Bangladeshi phone number (e.g. 017...).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/checkout-landing-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: englishPhone,
          address: form.address,
          landingPageId: landingPageId,
          district: 'Inside Dhaka', // Optional: you can add a dropdown if needed
        }),
      });

      const payload = await res.json();
      if (!res.ok || payload?.status === false) {
        throw new Error(payload.message || 'Failed to place order');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className='bg-white rounded-3xl p-8 shadow-xl text-center max-w-lg mx-auto'>
        <BadgeCheck size={64} className='text-green-500 mx-auto mb-4' />
        <h3 className='text-2xl font-bold text-slate-800 mb-2'>Order Confirmed!</h3>
        <p className='text-slate-500'>
          Your order has been successfully placed. Our team will contact you shortly to confirm the
          delivery.
        </p>
      </div>
    );
  }

  return (
    <div
      className='bg-white rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto border-4'
      style={{ borderColor: 'var(--lp-cta)' }}
    >
      <div className='mb-6 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100'>
        <div className='min-w-0 text-left'>
          <div className='font-bold text-slate-800 text-lg truncate'>
            {checkoutData.productName || 'Special Product'}
          </div>
          <div className='text-sm text-slate-500'>{checkoutData.subName || 'Limited offer'}</div>
        </div>
        <div className='shrink-0 text-2xl font-extrabold text-[var(--lp-cta)] tabular-nums'>
          {checkoutData.price ? `${bnDigits(subtotal)}৳` : 'Free'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4 text-left'>
        {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm'>{error}</div>}

        <div>
          <label className='block text-sm font-semibold text-slate-700 mb-1'>
            আপনার নাম (Your Name) <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className='w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--lp-cta)] text-lg'
            placeholder='আপনার সম্পূর্ণ নাম লিখুন'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-slate-700 mb-1'>
            মোবাইল নাম্বার (Mobile Number) <span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className='w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--lp-cta)] text-lg'
            placeholder='01XXXXXXXXX'
          />
        </div>

        <div>
          <label className='block text-sm font-semibold text-slate-700 mb-1'>
            সম্পূর্ণ ঠিকানা (Full Address) <span className='text-red-500'>*</span>
          </label>
          <textarea
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className='w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--lp-cta)] text-lg h-24 resize-none'
            placeholder='গ্রাম/মহল্লা, থানা, জেলা'
          />
        </div>

        {checkoutData.deliveryText && (
          <div className='text-center text-sm font-semibold bg-(--lp-highlight) text-[var(--lp-navy)] py-2 rounded-lg mt-2'>
            {checkoutData.deliveryText}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full mt-4 py-4 rounded-xl text-white font-bold text-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2'
          style={{ backgroundColor: 'var(--lp-cta)' }}
        >
          {loading ? 'Processing...' : 'Confirm Order 🚀'}
        </button>
      </form>
    </div>
  );
}
