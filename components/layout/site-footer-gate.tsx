"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/layout/site-footer"

// Whitelist of routes where the site footer should be rendered.
// Add additional pathnames here if more pages should include the footer.
const FOOTER_VISIBLE_PATHS: ReadonlyArray<string> = ["/", "/help"]

export function SiteFooterGate() {
  const pathname = usePathname()
  const shouldShow = pathname ? FOOTER_VISIBLE_PATHS.includes(pathname) : false
  if (!shouldShow) return null
  return <SiteFooter />
}
