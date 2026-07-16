import Link from 'next/link';
import { ListOrdered } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TickLottie } from './tick-lottie';
import { FloatingRotatingIcon } from '@/components/home/floating-rotating-icon';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; phone?: string; status?: string }>;
}) {
  const { code = 'EC00000000' } = await searchParams;

  return (
    <>
      <AppShell>
        <div className='mx-auto flex min-h-[calc(100dvh-140px)] max-w-md flex-col items-center justify-center gap-5 px-4 text-center'>
          {/* Animated success tick */}
          <div className='relative grid h-24 w-24 place-items-center rounded-full bg-success'>
            <TickLottie />
          </div>

          <div className='space-y-1'>
            <h1 className='text-xl font-bold text-foreground md:text-2xl'>অর্ডার সফল হয়েছে!</h1>
            <p className='text-sm text-muted-foreground'>
              অনুগ্রহ করে অপেক্ষা করুন, আমাদের প্রতিনিধি আপনার সাথে খুব দ্রুত যোগাযোগ করবেন।
            </p>
          </div>

          <div className='flex w-full flex-col gap-2'>
            <Link
              href='/'
              className='block w-full rounded-full border border-border bg-card py-3 text-center text-sm font-semibold text-foreground'
            >
              হোমে ফিরে যান
            </Link>
          </div>
        </div>
        <FloatingRotatingIcon />
      </AppShell>
    </>
  );
}
