"use client"

import type { ReactNode } from "react"
import { Loader2, Search } from "lucide-react"
import { cx } from "@/lib/format"

/* ── Page wrapper ── */
export function DashPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("space-y-5", className)}>{children}</div>
}

/* ── Page header with subtitle ── */
export function DashHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ── Glass stat card (semi-transparent, consistent style) ── */
export function DashGradientCard({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string
  value: string
  subValue?: string
  icon: React.ComponentType<{ className?: string }>
  gradient?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-sky-50/70 p-5 shadow-sm backdrop-blur-sm">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground md:text-3xl">{value}</p>
        {subValue && <p className="mt-1 text-xs text-muted-foreground/80">{subValue}</p>}
      </div>
    </div>
  )
}

/* ── Small metric card ── */
export function DashMetricCard({
  icon: Icon,
  color,
  label,
  value,
  subLabel,
}: {
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  label: string
  value: string | number
  subLabel?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
      {Icon && (
        <div className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-xl mb-1", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {subLabel && <p className="text-[11px] text-muted-foreground">{subLabel}</p>}
      </div>
    </div>
  )
}

/* ── Panel / Card ── */
export function DashPanel({
  children,
  className,
  noPadding,
}: {
  children: ReactNode
  className?: string
  noPadding?: boolean
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm",
        !noPadding && "p-5",
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ── Section title ── */
export function DashSectionTitle({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {action}
    </div>
  )
}

/* ── Search input ── */
export function DashSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div
      className={cx(
        "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-card px-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

/* ── Buttons ── */
export function DashPrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function DashSecondaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary active:scale-[0.98] disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ── Loading ── */
export function DashLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

/* ── Empty state ── */
export function DashEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.25} />}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

/* ── Status badge ── */
export function DashStatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600",
    PROCESSING: "bg-blue-50 text-blue-600",
    HOLD: "bg-purple-50 text-purple-600",
    PICKUP: "bg-cyan-50 text-cyan-600",
    DELIVERED: "bg-emerald-50 text-emerald-600",
    CUSTOMER_CANCELLED: "bg-red-50 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-600",
    TRASH: "bg-gray-100 text-gray-700",
  }
  return (
    <span className={cx("inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold", colors[status] || "bg-gray-100 text-gray-600")}>
      {label}
    </span>
  )
}
