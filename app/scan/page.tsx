import { ScanLine } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"

export default function ScanPage() {
  return (
    <AppShell>
      <BackHeader title="Scan" />
      <div className="py-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl bg-card p-10 text-center shadow-card">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
            <ScanLine className="h-8 w-8" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Scan a Product</h1>
          <p className="text-sm text-muted-foreground">
            Point your camera at a barcode or QR code to instantly find a product. (Demo placeholder)
          </p>
          <button className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            Open Camera
          </button>
        </div>
      </div>
    </AppShell>
  )
}
