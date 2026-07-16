'use client';

import { FloatingRotatingIcon } from '@/components/home/floating-rotating-icon';
import { AppShell } from '@/components/layout/app-shell';
import { useRouter } from 'next/navigation';

export default function PlaceOrderPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className='mx-auto flex min-h-[calc(100dvh-140px)] max-w-md flex-col items-center justify-center gap-5 px-4 text-center'>
        <div className='relative grid h-24 w-24 place-items-center rounded-full bg-emerald-500'>
          <svg
            className='h-12 w-12 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={3}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <div className='space-y-1'>
          <h1 className='text-xl font-bold text-foreground md:text-2xl'>অর্ডার সফল হয়েছে!</h1>
          <p className='text-sm text-muted-foreground'>
            অনুগ্রহ করে অপেক্ষা করুন, আমাদের প্রতিনিধি আপনার সাথে খুব দ্রুত যোগাযোগ করবেন।
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className='block w-full rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-white'
        >
          হোমে ফিরে যান
        </button>
      </div>
      <FloatingRotatingIcon />
    </AppShell>
  );
}
