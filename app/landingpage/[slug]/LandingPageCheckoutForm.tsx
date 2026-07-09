'use client';

import React, { useState } from 'react';
import { BadgeCheck, ArrowRight } from 'lucide-react';
import { BASE_URL } from '@/src/api/_shared/client';
import { bnDigits } from './LandingPageTemplate';

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

export default function LandingPageCheckoutForm({ landingPage }: { landingPage: any }) {
  const checkoutData = landingPage.checkoutSection || {};
  const UNIT_PRICE = Number(checkoutData.price || 0);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    qty: 1,
    area: 'inside' as 'inside' | 'outside',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const subtotal = UNIT_PRICE * form.qty;

  const setField =
    (k: 'name' | 'phone' | 'address') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return;
    setError('');

    const englishPhone = convertToEnglishDigits(form.phone).replace(/\s/g, '');
    if (!englishPhone.match(/^01[3-9]\d{8}$/)) {
      setError('Please provide a valid 11-digit phone number (e.g. 017...).');
      return;
    }

    const fullAddress = `[Qty: ${form.qty}, Area: ${form.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}] ${form.address}`;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/checkout-landing-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: englishPhone,
          address: fullAddress,
          landingPageId: landingPage.id,
          district: form.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka',
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
      <div className='text-center py-6'>
        <div className='mb-2 flex justify-center'>
          <BadgeCheck size={40} style={{ color: 'var(--lp-success)' }} />
        </div>
        <div className='text-lg font-bold' style={{ color: 'var(--lp-navy)' }}>
          অর্ডার গ্রহণ হয়েছে!
        </div>
        <p className='mt-1 text-sm opacity-80'>
          শীঘ্রই আমাদের প্রতিনিধি {form.phone} নম্বরে কল করে অর্ডার কনফার্ম করবেন।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='grid gap-4 text-left'>
      {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg text-sm'>{error}</div>}

      <label className='grid gap-1.5'>
        <span className='text-sm font-semibold' style={{ color: 'var(--lp-navy)' }}>
          আপনার নাম *
        </span>
        <input
          required
          value={form.name}
          onChange={setField('name')}
          placeholder='যেমন: রহিম উদ্দিন'
          className='w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-shadow'
          style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-foreground)' }}
        />
      </label>

      <label className='grid gap-1.5'>
        <span className='text-sm font-semibold' style={{ color: 'var(--lp-navy)' }}>
          মোবাইল নাম্বার *
        </span>
        <input
          required
          type='tel'
          inputMode='tel'
          value={form.phone}
          onChange={setField('phone')}
          placeholder='01XXXXXXXXX'
          className='w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-shadow'
          style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-foreground)' }}
        />
      </label>

      <div className='grid gap-1.5'>
        <span className='text-sm font-semibold' style={{ color: 'var(--lp-navy)' }}>
          পরিমাণ (কতটি) *
        </span>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            aria-label='কমান'
            onClick={() => setForm({ ...form, qty: Math.max(1, form.qty - 1) })}
            className='w-10 h-10 rounded-full border text-xl font-bold grid place-items-center hover:bg-black/5'
            style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-navy)' }}
          >
            −
          </button>
          <input
            readOnly
            value={bnDigits(form.qty)}
            className='w-16 text-center rounded-lg border bg-white px-2 py-2.5 text-base font-bold tabular-nums'
            style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-navy)' }}
          />
          <button
            type='button'
            aria-label='বাড়ান'
            onClick={() => setForm({ ...form, qty: Math.min(99, form.qty + 1) })}
            className='w-10 h-10 rounded-full border text-xl font-bold grid place-items-center hover:bg-black/5'
            style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-navy)' }}
          >
            +
          </button>
        </div>
      </div>

      <div className='grid gap-1.5'>
        <span className='text-sm font-semibold' style={{ color: 'var(--lp-navy)' }}>
          ডেলিভারি এরিয়া *
        </span>
        <div className='grid grid-cols-2 gap-2'>
          {(
            [
              { v: 'inside', label: 'ঢাকার ভিতরে' },
              { v: 'outside', label: 'ঢাকার বাইরে' },
            ] as const
          ).map((opt) => {
            const active = form.area === opt.v;
            return (
              <label
                key={opt.v}
                className='flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition'
                style={{
                  borderColor: active ? 'var(--lp-cta)' : 'var(--lp-border)',
                  backgroundColor: active ? 'var(--lp-highlight)' : 'white',
                  color: 'var(--lp-navy)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <input
                  type='radio'
                  name='area'
                  value={opt.v}
                  checked={active}
                  onChange={() => setForm({ ...form, area: opt.v })}
                  className='accent-(--lp-cta)'
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <label className='grid gap-1.5'>
        <span className='text-sm font-semibold' style={{ color: 'var(--lp-navy)' }}>
          সম্পূর্ণ ঠিকানা *
        </span>
        <textarea
          required
          value={form.address}
          onChange={setField('address')}
          placeholder='বাসা/রোড, এলাকা, থানা, জেলা'
          rows={3}
          className='w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition-shadow'
          style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-foreground)' }}
        />
      </label>

      {checkoutData.deliveryText && (
        <div
          className='rounded-lg px-3 py-2.5 text-sm'
          style={{
            backgroundColor: 'var(--lp-highlight)',
            color: 'var(--lp-highlight-foreground)',
          }}
        >
          {checkoutData.deliveryText}
        </div>
      )}

      <div className='flex justify-center mt-2'>
        <button type='submit' disabled={loading} className='btn-cta w-full'>
          {loading ? (
            'Processing...'
          ) : (
            <>
              {checkoutData.buttonText || 'অর্ডার কনফার্ম করুন'} <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
