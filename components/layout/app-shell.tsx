import type { ReactNode } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { BottomNavbar } from "@/components/layout/bottom-navbar"
import { SiteFooterGate } from "@/components/layout/site-footer-gate"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <DesktopHeader />
      <MobileHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-6">{children}</main>
      {/* White surface that holds the footer and the bottom-spacing reserved for
          the fixed mobile navbar — keeps the area below the footer white. */}
      <div className="bg-card pb-20 md:pb-0">
        <SiteFooterGate />
      </div>
      <BottomNavbar />
    </div>
  )
}
