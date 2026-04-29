"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export type ConfirmOptions = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  /**
   * "danger" styles the confirm button red (e.g., for delete actions).
   * "default" uses the standard primary style.
   */
  variant?: "default" | "danger"
}

type ConfirmContextValue = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null)

const DEFAULT_OPTIONS: Required<ConfirmOptions> = {
  title: "Are you sure?",
  message: "This action cannot be undone.",
  confirmText: "Confirm",
  cancelText: "Cancel",
  variant: "default",
}

/**
 * Provider that exposes an imperative `confirm()` returning Promise<boolean>.
 * Renders a single centered AlertDialog instance.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] =
    React.useState<Required<ConfirmOptions>>(DEFAULT_OPTIONS)
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null)

  const confirm = React.useCallback<ConfirmContextValue>(
    (opts = {}) =>
      new Promise<boolean>((resolve) => {
        setOptions({ ...DEFAULT_OPTIONS, ...opts })
        resolverRef.current = resolve
        setOpen(true)
      }),
    [],
  )

  const handleOpenChange = (next: boolean) => {
    if (!next && resolverRef.current) {
      resolverRef.current(false)
      resolverRef.current = null
    }
    setOpen(next)
  }

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(true)
      resolverRef.current = null
    }
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{options.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                options.variant === "danger" &&
                  "bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent/40",
              )}
            >
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/**
 * Imperatively show a confirmation dialog.
 *
 * @example
 *   const confirm = useConfirm()
 *   if (!(await confirm({ title: "Delete?", variant: "danger" }))) return
 */
export function useConfirm(): ConfirmContextValue {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>")
  }
  return ctx
}
