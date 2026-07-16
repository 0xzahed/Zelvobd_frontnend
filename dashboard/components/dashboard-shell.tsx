'use client';

import { useAuth } from '@/contexts/auth-context';
import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { DashboardSidebar } from './sidebar';

const PAGE_TITLES: { match: string | RegExp; title: string }[] = [
  { match: '/admin/products/new', title: 'New Product' },
  { match: /^\/admin\/products\/[^/]+$/, title: 'Edit Product' },
  { match: '/admin/products', title: 'Products' },
  { match: '/admin/categories/sub', title: 'Sub Categories' },
  { match: '/admin/categories', title: 'Categories' },
  { match: '/admin/category-banners', title: 'Category Banners' },
  { match: '/admin/trending', title: 'Trending Products' },
  { match: '/admin/free-delivery', title: 'Free Delivery' },
  { match: '/admin/sliders', title: 'Banners' },
  { match: '/admin/youtube', title: 'YouTube Videos' },
  { match: '/admin/promos', title: 'Promo Codes' },
  { match: '/admin/flash-sale', title: 'Flash Sales' },
  { match: '/admin/orders/pending', title: 'Pending Orders' },
  { match: '/admin/orders/processing', title: 'Processing Orders' },
  { match: '/admin/orders/hold', title: 'Hold Orders' },
  { match: '/admin/orders/pickup', title: 'Pickup Orders' },
  { match: '/admin/orders/delivered', title: 'Delivered Orders' },
  { match: '/admin/orders/cancelled', title: 'Cancelled Orders' },
  { match: '/admin/customers', title: 'Customers' },
  // { match: '/admin/chat', title: 'Live Chat' },
  { match: '/admin/admins', title: 'Admins' },
  { match: '/admin/footer', title: 'Footer' },
  { match: '/admin/notifications', title: 'Notifications' },
  { match: '/admin', title: 'Dashboard Overview' },
];

function getPageTitle(pathname: string) {
  for (const entry of PAGE_TITLES) {
    if (typeof entry.match === 'string') {
      if (pathname === entry.match || pathname.startsWith(entry.match + '/')) return entry.title;
    } else if (entry.match.test(pathname)) {
      return entry.title;
    }
  }
  return 'Dashboard';
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, authLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace('/login');
    }
  }, [authLoading, isAdmin, pathname, router]);

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  if (authLoading) {
    return (
      <div className='flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <p className='text-sm text-muted-foreground'>Checking admin session...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='flex min-h-dvh items-center justify-center bg-surface px-4 text-sm text-muted-foreground'>
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className='min-h-dvh overflow-x-hidden bg-surface'>
      <DashboardSidebar open={open} onClose={() => setOpen(false)} />

      {/* Top bar */}
      <header className='sticky top-0 z-20 ml-0 flex h-16 items-center justify-between border-b border-border/40 bg-surface-elevated px-4 md:ml-62.5 md:px-8'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setOpen(true)}
            className='grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-secondary md:hidden'
            aria-label='Open menu'
          >
            <Menu className='h-5 w-5' />
          </button>
          <h1 className='text-lg font-bold text-foreground'>{pageTitle}</h1>
        </div>
      </header>

      {/* Main */}
      <main className='ml-0 min-h-[calc(100dvh-4rem)] p-4 md:ml-62.5 md:p-6'>
        <div className='mx-auto max-w-[1600px]'>{children}</div>
      </main>
    </div>
  );
}
