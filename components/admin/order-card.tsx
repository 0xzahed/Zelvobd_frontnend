'use client';

import { useState } from 'react';
import { Eye, Trash2, ShieldAlert, Package, Truck, CheckCircle2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/src/hooks/api/useOrders';
import { useSteadfastDeliveryStatus } from '@/src/hooks/api/useSteadfast';
import { formatBDT } from '@/lib/format';
import { AdminIconButton } from '@/components/admin/admin-ui';
import { BASE_URL } from '@/src/api/_shared/client';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'text-blue-600 bg-blue-50 border-blue-100',
  PROCESSING: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  HOLD: 'text-purple-600 bg-purple-50 border-purple-100',
  PICKUP: 'text-cyan-600 bg-cyan-50 border-cyan-100',
  DELIVERED: 'text-green-600 bg-green-50 border-green-100',
  CUSTOMER_CANCELLED: 'text-red-600 bg-red-50 border-red-100',
  CANCELLED: 'text-red-600 bg-red-50 border-red-100',
  TRASH: 'text-gray-600 bg-gray-100 border-gray-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  HOLD: 'Hold',
  PICKUP: 'Pickup',
  DELIVERED: 'Delivered',
  CUSTOMER_CANCELLED: 'Customer Cancelled',
  CANCELLED: 'Cancelled',
  TRASH: 'Trash',
};

type OrderCardProps = {
  order: Order;
  onDelete: (order: Order) => void;
  onFraudCheck: (phone: string) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onSyncSteadfast?: (orderId: string) => void;
  isSyncing?: boolean;
};

export function OrderCard({
  order,
  onDelete,
  onFraudCheck,
  onStatusChange,
  onSyncSteadfast,
  isSyncing,
}: OrderCardProps) {
  const { data: steadfastStatusData, isLoading: isStatusLoading } = useSteadfastDeliveryStatus(
    order.consignmentId ? order.code : null
  );

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md border-border/60`}
    >
      {/* Header section */}
      <div className='flex items-start justify-between border-b border-border/50 bg-muted/20 p-4'>
        <div className='flex items-start gap-3'>
          <div>
            <h3 className='text-sm font-bold text-primary'>{order.code}</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        {onStatusChange ? (
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} className='bg-white text-foreground'>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col p-4'>
        {/* Customer Details */}
        <div className='mb-4 space-y-1'>
          <p className='text-sm font-semibold text-foreground'>{order.customerName}</p>
          <p className='text-sm text-muted-foreground'>{order.customerPhone}</p>
          <p className='text-xs text-muted-foreground line-clamp-2' title={order.address}>
            {order.address}, {order.district}
          </p>
        </div>

        {/* Steadfast Info */}
        <div className='mb-4 flex flex-col gap-1 rounded-lg border border-primary/10 bg-primary/5 p-3'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-primary'>
            <Package className='h-3.5 w-3.5' />
            Courier Status
          </div>
          {order.trackingCode || order.consignmentId ? (
            <div className='mt-1 space-y-1 text-xs text-muted-foreground'>
              {order.consignmentId && (
                <p>
                  <span className='font-semibold text-foreground/80'>Consignment:</span>{' '}
                  {order.consignmentId}
                </p>
              )}
              {order.trackingCode && (
                <p>
                  <span className='font-semibold text-foreground/80'>Tracking:</span>{' '}
                  <span className='font-mono text-primary'>{order.trackingCode}</span>
                </p>
              )}
              
              <div className="mt-2 pt-2 border-t border-primary/10">
                <p className="flex items-center gap-2">
                  <span className='font-semibold text-foreground/80'>Live Status:</span>
                  {isStatusLoading ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Fetching...
                    </span>
                  ) : steadfastStatusData ? (
                    <span className="font-semibold text-primary capitalize">
                      {steadfastStatusData.delivery_status?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  ) : (
                    <span className="text-red-500">Failed to fetch</span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>Not synced with Steadfast yet</p>
          )}
        </div>

        {/* Ordered Items */}
        {order.items && order.items.length > 0 && (
          <div className='mb-4 space-y-2'>
            <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              Ordered Items
            </h4>
            <ul className='space-y-2'>
              {order.items.map((item, idx) => {
                const imageUrl = item.productImage?.startsWith('http')
                  ? item.productImage
                  : item.productImage
                    ? `${BASE_URL.replace(/\/api\/v1$/, '')}${item.productImage}`
                    : null;

                return (
                  <li
                    key={item.id || idx}
                    className='flex gap-2 text-xs items-center bg-muted/20 p-2 rounded-md'
                  >
                    {imageUrl && (
                      <div className='h-10 w-10 shrink-0 overflow-hidden rounded bg-muted'>
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className='h-full w-full object-cover'
                        />
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-foreground line-clamp-1'>{item.productName}</p>
                      <p className='text-muted-foreground mt-0.5'>
                        {item.color && <span>{item.color}</span>}
                        {item.color && item.size && <span className='mx-1'>•</span>}
                        {item.size && <span>{item.size}</span>}
                      </p>
                    </div>
                    <div className='text-right shrink-0'>
                      <p className='font-medium'>{formatBDT(Number(item.price))}</p>
                      <p className='text-muted-foreground mt-0.5'>Qty: {item.quantity}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className='mb-4 mt-auto rounded-lg border border-border/50 bg-muted/10 p-3 text-xs'>
          <div className='flex justify-between py-1'>
            <span className='text-muted-foreground'>Items ({order.items?.length || 0})</span>
            <span className='font-medium'>{formatBDT(Number(order.subtotal))}</span>
          </div>
          <div className='flex justify-between py-1'>
            <span className='text-muted-foreground'>Shipping</span>
            <span className='font-medium'>{formatBDT(Number(order.shippingCharge))}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className='flex justify-between py-1 text-primary'>
              <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
              <span className='font-medium'>-{formatBDT(Number(order.discountAmount))}</span>
            </div>
          )}
          <div className='mt-1 flex justify-between border-t border-border/50 pt-2 font-bold text-foreground'>
            <span>Total</span>
            <span>{formatBDT(Number(order.total))}</span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-wrap items-center gap-2 pt-2'>
          {onSyncSteadfast && !order.consignmentId && (
            <button
              onClick={() => onSyncSteadfast(order.id)}
              disabled={isSyncing}
              className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50'
            >
              <Truck className='h-3.5 w-3.5' />
              Send to Steadfast
            </button>
          )}

          <button
            onClick={() => onFraudCheck(order.customerPhone)}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100'
          >
            <ShieldAlert className='h-3.5 w-3.5' />
            Fraud Check
          </button>

          <AdminIconButton aria-label='Delete' variant='danger' onClick={() => onDelete(order)}>
            <Trash2 className='h-4 w-4' />
          </AdminIconButton>
        </div>
      </div>
    </div>
  );
}
