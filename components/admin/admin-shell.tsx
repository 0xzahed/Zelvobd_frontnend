'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  CirclePlus,
  FolderTree,
  Gauge,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings2,
  ShieldAlert,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cx } from '@/lib/format';
import { notify } from '@/lib/notify';
import { useConfirm } from '@/components/ui/confirm-dialog';

type NavChild = { href: string; label: string };

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  exact?: boolean;
  children?: NavChild[];
  section?: string;
};

const MENU: NavItem[] = [
  { section: 'Menu', label: 'Overview', icon: LayoutDashboard, href: '/admin', exact: true },
  {
    section: 'Catalog',
    label: 'Categories',
    icon: FolderTree,
    children: [
      { href: '/admin/categories', label: 'Category' },
      { href: '/admin/categories/sub', label: 'Sub Category' },
      { href: '/admin/category-banners', label: 'Category Banner' },
    ],
  },
  { section: 'Catalog', label: 'Products', icon: Package, href: '/admin/products' },
  { section: 'Catalog', label: 'Trending Products', icon: TrendingUp, href: '/admin/trending' },
  { section: 'Catalog', label: 'Free Delivery', icon: Truck, href: '/admin/free-delivery' },
  {
    section: 'Marketing',
    label: 'Sliders',
    icon: Sparkles,
    children: [{ href: '/admin/sliders', label: 'Sliders List' }],
  },
  { section: 'Marketing', label: 'YouTube Videos', icon: Youtube, href: '/admin/youtube' },
  { section: 'Marketing', label: 'Promos', icon: CircleDollarSign, href: '/admin/promos' },
  { section: 'Marketing', label: 'Flash Sale', icon: Gauge, href: '/admin/flash-sale' },
  { section: 'Marketing', label: 'Landing Pages', icon: LayoutTemplate, href: '/admin/landing-pages' },
  {
    section: 'Sales',
    label: 'Orders',
    icon: ShoppingBag,
    children: [
      { href: '/admin/orders/pending', label: 'Pending Orders' },
      { href: '/admin/orders/processing', label: 'Processing Orders' },
      { href: '/admin/orders/hold', label: 'Hold Orders' },
      { href: '/admin/orders/pickup', label: 'Pickup Orders' },
      { href: '/admin/orders/delivered', label: 'Delivered Orders' },
      { href: '/admin/orders/customer-cancelled', label: 'Customer Cancelled' },
      { href: '/admin/orders/cancelled', label: 'Cancelled Orders' },
      { href: '/admin/orders/trash', label: 'Trash Orders' },
    ],
  },
  { section: 'Sales', label: 'Customers', icon: Users, href: '/admin/customers' },
  { section: 'Support', label: 'Live Chat', icon: MessageSquare, href: '/admin/chat' },
  { section: 'System', label: 'Admins', icon: ShieldCheck, href: '/admin/admins' },
  { section: 'System', label: 'Settings', icon: Settings, href: '/admin/settings' },
  { section: 'System', label: 'Footer', icon: Settings2, href: '/admin/footer' },
];

function isChildActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

function isGroupActive(pathname: string, item: NavItem) {
  if (!item.children) return false;
  return item.children.some((child) => isChildActive(pathname, child.href));
}

function groupBySection(items: NavItem[]) {
  const groups: { section: string; items: NavItem[] }[] = [];
  for (const item of items) {
    const section = item.section ?? 'Menu';
    const existing = groups.find((group) => group.section === section);
    if (existing) existing.items.push(item);
    else groups.push({ section, items: [item] });
  }
  return groups;
}

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
  { match: '/admin/orders/customer-cancelled', title: 'Customer Cancelled' },
  { match: '/admin/orders/cancelled', title: 'Cancelled Orders' },
  { match: '/admin/orders/trash', title: 'Trash Orders' },
  { match: '/admin/customers', title: 'Customers' },
  { match: '/admin/chat', title: 'Live Chat' },
  { match: '/admin/admins', title: 'Admins' },
  { match: '/admin/settings', title: 'Settings' },
  { match: '/admin/footer', title: 'Footer' },
  { match: '/admin/notifications', title: 'Notifications' },
  { match: '/admin', title: 'Overview' },
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

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAdmin, authLoading, logoutAdmin } = useAuth();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initialOpenGroups = useMemo(() => {
    const set: Record<string, boolean> = {};
    for (const item of MENU) {
      if (item.children && isGroupActive(pathname, item)) {
        set[item.label] = true;
      }
    }
    return set;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpenGroups);

  useEffect(() => {
    setOpenGroups((prev) => ({ ...prev, ...initialOpenGroups }));
  }, [initialOpenGroups]);

  useEffect(() => {
    setReady(true);
  }, []);

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
    if (!ready) return;
    if (authLoading) return;

    if (!isAdmin) {
      router.replace('/login');
    }
  }, [ready, authLoading, isAdmin, pathname, router]);

  const handleLogout = async () => {
    if (loggingOut) return;

    const approved = await confirm({
      title: 'Logout?',
      message: 'Do you want to sign out now?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!approved) return;

    try {
      setLoggingOut(true);
      await logoutAdmin();
      notify.success({
        title: 'Logged out',
        message: 'You have been signed out successfully.',
      });
      router.replace('/login');
    } catch (error) {
      notify.error({
        title: 'Logout failed',
        message: (error as { message?: string })?.message || 'Please try again.',
      });
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const sections = groupBySection(MENU);
  const pageTitle = getPageTitle(pathname);

  if (!ready || authLoading) {
    return (
      <div className='flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface px-4'>
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
      {open && (
        <button
          type='button'
          aria-label='Close menu backdrop'
          onClick={() => setOpen(false)}
          className='fixed inset-0 z-30 bg-black/35 md:hidden'
        />
      )}
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 w-70 border-r border-border/60 bg-surface-elevated transition-transform duration-300 ease-out md:w-64 md:translate-x-0',
          open ? 'translate-x-0 shadow-xl' : '-translate-x-full',
        )}
      >
        <div className='flex h-dvh flex-col'>
          <div className='flex h-16 items-center justify-between px-4'>
            <Link href='/admin' prefetch={false} className='flex items-center gap-2.5'>
              <span className='text-lg font-bold text-foreground'>Zelvobd</span>
            </Link>
            <button onClick={() => setOpen(false)} className='md:hidden' aria-label='Close menu'>
              <X className='h-5 w-5' />
            </button>
          </div>
          <div className='px-4 pb-2'>
            <label className='flex h-9 items-center gap-2 rounded-lg border border-border/80 bg-white px-3'>
              <Search className='h-4 w-4 text-muted-foreground' />
              <input placeholder='Search' className='w-full bg-transparent text-sm outline-none' />
            </label>
          </div>
          <nav className='flex-1 overflow-y-auto px-3 pb-6'>
            {sections.map((group, gi) => (
              <div key={group.section} className={gi === 0 ? '' : 'mt-4'}>
                <p className='px-3 pb-2 pt-2 text-[11px] font-medium text-muted-foreground/80'>
                  {group.section}
                </p>
                <ul className='space-y-0.5'>
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    if (!item.children) {
                      const active = item.exact
                        ? pathname === item.href
                        : !!item.href && isChildActive(pathname, item.href);
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href!}
                            prefetch={false}
                            onClick={() => setOpen(false)}
                            className={cx(
                              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-normal transition-all duration-200',
                              active
                                ? 'border border-border/70 bg-white text-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                            )}
                          >
                            <Icon
                              className={cx(
                                'h-4 w-4 shrink-0',
                                active ? 'text-primary' : 'text-muted-foreground',
                              )}
                            />
                            <span className='flex-1'>{item.label}</span>
                          </Link>
                        </li>
                      );
                    }

                    const groupActive = isGroupActive(pathname, item);
                    const isOpen = openGroups[item.label] ?? false;
                    const activeChildHref = item.children.reduce<string | null>((best, child) => {
                      if (!isChildActive(pathname, child.href)) return best;
                      if (!best || child.href.length > best.length) return child.href;
                      return best;
                    }, null);
                    return (
                      <li key={item.label}>
                        <button
                          type='button'
                          onClick={() => toggleGroup(item.label)}
                          aria-expanded={isOpen}
                          className={cx(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-normal transition-all duration-200',
                            groupActive
                              ? 'border border-border/70 bg-white text-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                          )}
                        >
                          <Icon
                            className={cx(
                              'h-4 w-4 shrink-0',
                              groupActive ? 'text-primary' : 'text-muted-foreground',
                            )}
                          />
                          <span className='flex-1 text-left'>{item.label}</span>
                          <ChevronRight
                            className={cx(
                              'h-3.5 w-3.5 transition-transform duration-200',
                              isOpen ? 'rotate-90' : 'rotate-0',
                            )}
                          />
                        </button>
                        <div
                          className={cx(
                            'grid transition-all duration-200 ease-out',
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                          )}
                        >
                          <ul className='ml-5.5 overflow-hidden border-l border-border/60 pl-3'>
                            {item.children.map((child) => {
                              const active = child.href === activeChildHref;
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    prefetch={false}
                                    onClick={() => setOpen(false)}
                                    className={cx(
                                      'my-0.5 flex items-center rounded-lg px-3 py-1.5 text-[13px] font-normal transition-colors duration-150',
                                      active
                                        ? 'bg-white text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className='mt-auto px-3 pb-4'>
            <div className='border-t border-border/70 pt-3'>
              <div className='flex items-center gap-3 rounded-sm px-3 py-2.5'>
                <div className='grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary'>
                  {admin?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-[13px] font-semibold text-foreground'>
                    {admin?.email || 'Administrator'}
                  </p>
                  <p className='text-[11px] text-muted-foreground'>Administrator</p>
                </div>
                <ChevronRight className='h-4 w-4 text-muted-foreground' />
              </div>
              <button
                type='button'
                onClick={() => void handleLogout()}
                disabled={loggingOut}
                className='flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-[13px] text-foreground hover:bg-surface disabled:opacity-60'
              >
                <LogOut className='h-4 w-4' /> {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className='sticky top-0 z-20 ml-0 flex h-14 items-center justify-between border-b border-border/70 bg-surface-elevated/95 px-3 backdrop-blur-md md:ml-64 md:h-16 md:px-6'>
        <button
          onClick={() => setOpen(true)}
          className='grid h-9 w-9 place-items-center rounded-xl transition hover:bg-surface md:hidden'
          aria-label='Open menu'
        >
          <Menu className='h-5 w-5' />
        </button>
        <p className='text-sm font-semibold text-foreground md:text-base'>{pageTitle}</p>
        <div className='hidden w-9 md:block' />
      </header>

      <main className='ml-0 min-h-[calc(100dvh-3.5rem)] p-3 sm:p-4 md:ml-64 md:min-h-[calc(100dvh-4rem)] md:p-6'>
        {children}
      </main>
    </div>
  );
}
