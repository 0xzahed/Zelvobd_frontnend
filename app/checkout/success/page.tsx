import Link from "next/link"
import { Check, MessageSquare, Package, ListOrdered } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { CopyCode } from "./copy-code"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; phone?: string; status?: string }>
}) {
  const { code = "EC00000000", phone = "", status = "Pending" } = await searchParams
  const maskedPhone = phone ? phone.replace(/(\+?\d{3,4})(\d+)(\d{2})/, "$1•••••$3") : ""

  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-8 text-center md:py-16">
        {/* Animated success tick */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full border border-success/20" />
          <div className="absolute inset-0 z-0 animate-ping rounded-full bg-success/30" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full bg-success text-white shadow-[0_14px_30px_rgba(34,197,94,0.35)]">
            <Check className="h-11 w-11 animate-[pulse_1.5s_ease-in-out_infinite]" strokeWidth={3} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">অভিনন্দন!</h1>
          <p className="text-sm text-muted-foreground">
            আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
          </p>
        </div>

        {/* Tracking code card */}
        <div className="w-full rounded-2xl bg-card p-5 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Package className="h-4 w-4" />
            Tracking Code
          </div>
          <CopyCode code={code} />
          {maskedPhone && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-primary">
              <MessageSquare className="h-3 w-3" />
              SMS sent to {maskedPhone}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-border/60 bg-background px-4 py-3 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Link
            href={`/orders?code=${encodeURIComponent(code)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-white"
          >
            <ListOrdered className="h-4 w-4" />
            My Orders
          </Link>
          <Link
            href="/"
            className="block w-full rounded-full border border-border bg-card py-3 text-center text-sm font-semibold text-foreground"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
