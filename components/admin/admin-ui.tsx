import type { ReactNode } from "react"

export function AdminPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function AdminPageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h2>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function AdminPrimaryButton({ children, ...props }: { children: ReactNode; [key: string]: any }) {
  return (
    <button
      {...props}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}
