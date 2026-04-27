import type { ReactNode } from "react"
import { MobileHeader } from "@/components/layout/mobile-header"
import { DesktopHeader } from "@/components/layout/desktop-header"
import { BottomNavbar } from "@/components/layout/bottom-navbar"
import { SiteFooter } from "@/components/layout/site-footer"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20 md:pb-0">
      <DesktopHeader />
      <MobileHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-6">{children}</main>
      <SiteFooter />
      <BottomNavbar />
    </div>
  )
}
