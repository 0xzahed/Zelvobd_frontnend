'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Gauge,
  CircleDollarSign,
  FolderTree,
  Users,
  Zap,
  CreditCard,
  Wallet,
  Banknote,
  XCircle,
  Archive,
  Truck,
  Trash2,
  Tags,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useProducts } from '@/src/hooks/api/useProducts';
import { useOrders, type Order } from '@/src/hooks/api/useOrders';
import { formatBDT, formatRelativeTime } from '@/lib/format';
import {
  DashPage,
  DashGradientCard,
  DashMetricCard,
  DashPanel,
  DashSectionTitle,
  DashStatusBadge,
  DashLoading,
} from '@/dashboard/components/dash-ui';

const WeeklySalesChart = dynamic(
  () => import('@/app/admin/charts').then((m) => ({ default: m.WeeklySalesChart })),
  { ssr: false },
);
const BestSellingPie = dynamic(
  () => import('@/app/admin/charts').then((m) => ({ default: m.BestSellingPie })),
  { ssr: false },
);
const OrderStatusChart = dynamic(
  () => import('@/app/admin/charts').then((m) => ({ default: m.OrderStatusChart })),
  { ssr: false },
);

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PROCESSING: '#3B82F6',
  HOLD: '#8B5CF6',
  PICKUP: '#06B6D4',
  DELIVERED: '#10B981',
  CUSTOMER_CANCELLED: '#EF4444',
  CANCELLED: '#6B7280',
  TRASH: '#1F2937',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  HOLD: 'Hold',
  PICKUP: 'Pickup',
  DELIVERED: 'Delivered',
  CUSTOMER_CANCELLED: 'Cancelled',
  CANCELLED: 'Cancelled',
  TRASH: 'Trash',
};

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const QUICK_LINKS = [
  { href: '/admin/products', label: 'Products', icon: Package, color: 'bg-blue-500' },
  { href: '/admin/orders/pending', label: 'Orders', icon: ShoppingBag, color: 'bg-violet-500' },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, color: 'bg-emerald-500' },
  { href: '/admin/flash-sale', label: 'Flash Sale', icon: Gauge, color: 'bg-rose-500' },
  { href: '/admin/promos', label: 'Promos', icon: CircleDollarSign, color: 'bg-amber-500' },
  { href: '/admin/sliders', label: 'Sliders', icon: Sparkles, color: 'bg-cyan-500' },
  { href: '/admin/customers', label: 'Customers', icon: Users, color: 'bg-indigo-500' },
  { href: '/admin/trending', label: 'Trending', icon: TrendingUp, color: 'bg-teal-500' },
];

export default function DashboardOverview() {
  const { admin } = useAuth();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 1000 }, { includeUnavailable: true });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ limit: 10000 });

  const products = (productsData as any)?.products || productsData || [];
  const ordersMeta = (ordersData as any)?.meta;
  const orders = (ordersData as any)?.orders || [];

  const stats = useMemo(() => {
    const totalProducts = Array.isArray(products) ? products.length : 0;
    const totalOrders = ordersMeta?.total || orders.length;
    const delivered = (orders as Order[]).filter((o) => o.status === 'DELIVERED');
    const pendingOrders = (orders as Order[]).filter((o) => o.status === 'PENDING').length;
    const deliveredOrders = delivered.length;
    const processingOrders = (orders as Order[]).filter((o) => o.status === 'PROCESSING').length;
    const cancelledOrders = (orders as Order[]).filter(
      (o) => o.status === 'CANCELLED' || o.status === 'CUSTOMER_CANCELLED',
    ).length;
    const holdOrders = (orders as Order[]).filter((o) => o.status === 'HOLD').length;
    const pickupOrders = (orders as Order[]).filter((o) => o.status === 'PICKUP').length;
    const trashOrders = (orders as Order[]).filter((o) => o.status === 'TRASH').length;
    const totalRevenue = delivered.reduce((sum, o) => sum + Number(o.total || 0), 0);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const todayRevenue = delivered
      .filter((o) => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const yesterdayRevenue = delivered
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= yesterdayStart && d < todayStart;
      })
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const thisMonthRevenue = delivered
      .filter((o) => new Date(o.createdAt) >= monthStart)
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const lastMonthRevenue = delivered
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= lastMonthStart && d <= lastMonthEnd;
      })
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      processingOrders,
      cancelledOrders,
      todayRevenue,
      yesterdayRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      holdOrders,
      pickupOrders,
      trashOrders,
    };
  }, [products, orders, ordersMeta]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      HOLD: 0,
      PICKUP: 0,
      DELIVERED: 0,
      CUSTOMER_CANCELLED: 0,
      CANCELLED: 0,
      TRASH: 0,
    };
    (orders as Order[]).forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value,
        color: STATUS_COLORS[key] || '#6B7280',
      }));
  }, [orders]);

  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const dayTotals: Record<string, number> = {};
    const dayCounts: Record<string, number> = {};
    days.forEach((d) => {
      dayTotals[d] = 0;
      dayCounts[d] = 0;
    });
    (orders as Order[]).forEach((o) => {
      const d = new Date(o.createdAt);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diffDays < 7) {
        const dayName = days[d.getDay()];
        dayTotals[dayName] += Number(o.total || 0);
        dayCounts[dayName]++;
      }
    });

    return days.map((day) => ({
      day,
      sales: dayTotals[day],
      orders: dayCounts[day],
    }));
  }, [orders]);

  const bestSellingData = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];
    return products.slice(0, 5).map((p: any, i: number) => ({
      name: p.name.length > 10 ? p.name.slice(0, 10) + '...' : p.name,
      value: p.soldCount || p.price || 1,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [products]);

  const recentOrders = useMemo(() => {
    return [...(orders as Order[])]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p: any) => p.stock === false || p.availability === false).slice(0, 5);
  }, [products]);

  const isLoading = productsLoading || ordersLoading;

  if (isLoading) {
    return (
      <DashPage>
        <div>
          <h2 className='text-xl font-bold text-foreground md:text-2xl'>
            Welcome back, {admin?.email?.split('@')[0] || 'Admin'}
          </h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>Loading your dashboard...</p>
        </div>
        <DashLoading label='Fetching latest data...' />
      </DashPage>
    );
  }

  return (
    <DashPage>
      {/* Main Overview Metrics */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
        <DashMetricCard
          label='Total Products'
          value={stats.totalProducts}
          subLabel='All store items'
        />
        <DashMetricCard
          label='Total Sells'
          value={stats.deliveredOrders}
          subLabel='From delivered orders'
        />
        <DashMetricCard
          label='Total Income'
          value={formatBDT(stats.totalRevenue)}
          subLabel='Overall revenue'
        />
        <DashMetricCard
          label='Total Orders'
          value={stats.totalOrders}
          subLabel='All status included'
        />
        <DashMetricCard
          label='Pending Orders'
          value={stats.pendingOrders}
          subLabel='Awaiting confirmation'
        />
        <DashMetricCard
          label='Processing'
          value={stats.processingOrders}
          subLabel='Being processed'
        />
        <DashMetricCard label='Hold Orders' value={stats.holdOrders} subLabel='On hold status' />
        <DashMetricCard
          label='Pickup Orders'
          value={stats.pickupOrders}
          subLabel='Ready for pickup'
        />
        <DashMetricCard
          label='Delivered'
          value={stats.deliveredOrders}
          subLabel='Successfully delivered'
        />
        <DashMetricCard
          label='Cancel Orders'
          value={stats.cancelledOrders}
          subLabel='User & Admin cancelled'
        />
        <DashMetricCard label='Trash' value={stats.trashOrders} subLabel='Deleted orders' />
      </div>

      {/* Charts row */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <WeeklySalesChart data={weeklyChartData} />
        <BestSellingPie data={bestSellingData} />
      </div>

      {/* Order status + low stock alerts */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <OrderStatusChart data={statusChartData} />

        {/* <DashPanel>
          <DashSectionTitle title="Low Stock Alert" />
          {lowStockProducts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">All stocked up</div>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.map((p: any) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-surface/50 p-3 text-sm">
                  <span className="truncate text-foreground">{p.name}</span>
                  <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                    Out of stock
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashPanel> */}
      </div>

      {/* Quick access */}
      <DashPanel>
        <DashSectionTitle title='Quick Access' />
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className='group flex items-center gap-3 rounded-xl border border-border/40 bg-surface/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-secondary/40 hover:shadow-sm'
              >
                <div
                  className={`grid h-9 w-9 place-items-center rounded-lg ${link.color} shadow-sm`}
                >
                  <Icon className='h-4 w-4 text-white' />
                </div>
                <span className='text-[13px] font-medium text-foreground'>{link.label}</span>
                <ArrowUpRight className='ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100' />
              </Link>
            );
          })}
        </div>
      </DashPanel>

      {/* Recent orders table */}
      <DashPanel noPadding>
        <div className='flex items-center justify-between border-b border-border/40 p-5'>
          <h3 className='text-sm font-bold text-foreground'>Recent Order</h3>
          <Link
            href='/admin/orders/pending'
            className='text-xs font-medium text-primary hover:underline'
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className='p-10 text-center text-sm text-muted-foreground'>No orders yet</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className='hidden overflow-x-auto md:block'>
              <table className='w-full text-left text-sm'>
                <thead>
                  <tr className='border-b border-border/40 bg-surface/30 text-muted-foreground'>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Invoice No
                    </th>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Order Time
                    </th>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Customer Name
                    </th>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Method
                    </th>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Amount
                    </th>
                    <th className='px-5 py-3 text-xs font-semibold uppercase tracking-wide'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className='border-b border-border/30 transition hover:bg-secondary/20'
                    >
                      <td className='px-5 py-3.5 font-semibold text-foreground'>#{order.code}</td>
                      <td className='px-5 py-3.5 text-muted-foreground'>
                        {formatRelativeTime(order.createdAt)}
                      </td>
                      <td className='px-5 py-3.5 text-foreground'>{order.customerName}</td>
                      <td className='px-5 py-3.5 text-muted-foreground'>Cash on Delivery</td>
                      <td className='px-5 py-3.5 font-medium text-foreground'>
                        {formatBDT(order.total)}
                      </td>
                      <td className='px-5 py-3.5'>
                        <DashStatusBadge
                          status={order.status}
                          label={STATUS_LABELS[order.status] || order.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className='divide-y divide-border/30 md:hidden'>
              {recentOrders.map((order) => (
                <div key={order.id} className='p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-foreground'>#{order.code}</span>
                    <DashStatusBadge
                      status={order.status}
                      label={STATUS_LABELS[order.status] || order.status}
                    />
                  </div>
                  <div className='mt-2 flex items-center justify-between text-sm'>
                    <span className='text-foreground'>{order.customerName}</span>
                    <span className='font-medium text-foreground'>{formatBDT(order.total)}</span>
                  </div>
                  <div className='mt-1 flex items-center justify-between text-xs text-muted-foreground'>
                    <span>{formatRelativeTime(order.createdAt)}</span>
                    <span>Cash on Delivery</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashPanel>
    </DashPage>
  );
}
