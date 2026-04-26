import Link from "next/link"
import { Check, MessageSquare, Package } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { CopyCode } from "./copy-code"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; phone?: string }>
}) {
  const { code = "EC00000000", phone = "" } = await searchParams
  const maskedPhone = phone ? phone.replace(/(\+?\d{3,4})(\d+)(\d{2})/, "$1•••••$3") : ""

  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-8 text-center md:py-16">
        {/* Animated success tick */}
        <div className="relative">
          <div className="absolute inset-0 -z-0 animate-ping rounded-full bg-[#22C55E]/30" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#22C55E] text-white">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Order successfully submitted</h1>
          <p className="text-sm text-muted-foreground">
            Thanks for your order! You can track your shipment using the code below.
          </p>
        </div>

        {/* Tracking code card */}
        <div className="w-full rounded-2xl bg-card p-5">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Package className="h-4 w-4" />
            Tracking Code
          </div>
          <CopyCode code={code} />
          {maskedPhone && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#EEF0FB] px-3 py-1 text-[11px] font-medium text-[#306FD7]">
              <MessageSquare className="h-3 w-3" />
              SMS sent to {maskedPhone}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <Link
            href="/more"
            className="block w-full rounded-full bg-[#306FD7] py-3 text-center text-sm font-semibold text-white"
          >
            Track My Orders
          </Link>
          <Link
            href="/"
            className="block w-full rounded-full border border-border bg-card py-3 text-center text-sm font-semibold text-foreground"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
