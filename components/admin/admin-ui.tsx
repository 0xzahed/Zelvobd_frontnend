"use client"

import type { ReactNode } from "react"
import { Loader2, Search } from "lucide-react"
import { cx } from "@/lib/format"

/* ── Page layout ── */

export function AdminPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cx("admin-page space-y-5", className)}>{children}</div>
}

export function AdminPageHeader({
  title,
  description,
  count,
  actions,
}: {
  title: string
  description?: string
  count?: string | number
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h1>
        {(description || count !== undefined) && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {description}
            {description && count !== undefined ? " · " : ""}
            {count !== undefined && <span>{count}</span>}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function AdminToolbar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cx("flex w-full flex-wrap items-center gap-2 sm:flex-nowrap", className)}>
      {children}
    </div>
  )
}

/* ── Search & actions ── */

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  onKeyDown,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  className?: string
}) {
  return (
    <div
      className={cx(
        "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 shadow-sm transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

export function AdminPrimaryButton({
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
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function AdminSecondaryButton({
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
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-secondary active:scale-[0.98] disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ── Panels & cards ── */

export function AdminPanel({
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
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-card",
        !noPadding && "p-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AdminCard({
  children,
  className,
  hover,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-border/70 bg-card p-4 shadow-sm transition",
        hover && "hover:border-primary/20 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ── States ── */

export function AdminLoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.25} />}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ── Form helpers ── */

export function AdminField({
  label,
  children,
  full,
}: {
  label: string
  children: ReactNode
  full?: boolean
}) {
  return (
    <label className={cx("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

export function AdminInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "admin-input h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  )
}

export function AdminSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cx(
        "admin-input h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/* ── Modal ── */

export function AdminModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}) {
  if (!open) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cx(
          "w-full rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 duration-200",
          sizes[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border/60 px-6 py-4">
          <h3 className="text-center text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ── Icon action buttons ── */

export function AdminIconButton({
  children,
  onClick,
  variant = "default",
  disabled,
  "aria-label": ariaLabel,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "danger"
  disabled?: boolean
  "aria-label"?: string
  className?: string
}) {
  const variants = {
    default: "bg-secondary text-foreground hover:bg-primary hover:text-white",
    primary: "bg-secondary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        "grid h-8 w-8 place-items-center rounded-full transition active:scale-95 disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}
