"use client"

import { Home, ScanLine } from "lucide-react"
import { RiCustomerService2Line } from "react-icons/ri"
import { BiSolidOffer } from "react-icons/bi"
import { FiMenu } from "react-icons/fi"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SCANNER_INDEX = 2

export function BottomNavbar() {
  const pathname = usePathname()

  const navItems = [
    { label: "Home", Icon: Home, path: "/" },
    { label: "Help", Icon: RiCustomerService2Line, path: "/help" },
    { label: "Scanner", Icon: ScanLine, path: "/scan" },
    { label: "Offer", Icon: BiSolidOffer, path: "/offers" },
    { label: "More", Icon: FiMenu, path: "/more" },
  ]

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname === path || pathname?.startsWith(path + "/")
  }

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/product/")
  ) {
    return null
  }

  return (
    <nav
      className="rm-bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden"
      aria-label="Bottom navigation"
    >
      <style>{`
        .rm-bottom-nav {
          --nav-height: 64px;
          --indicator-size: 60px;
          /* Cutout radius == indicator outer radius, so the see-through gap
             matches the previous ring exactly. */
          --cutout-radius: calc(var(--indicator-size) / 2);
        }

        @media (min-width: 380px) {
          .rm-bottom-nav {
            --nav-height: 70px;
            --indicator-size: 66px;
          }
        }

        .rm-bottom-nav * {
          box-sizing: border-box;
        }

        .rm-bottom-nav .navigation-shell {
          position: relative;
          width: 100%;
        }

        .rm-bottom-nav .navigation {
          position: relative;
          width: 100%;
          height: var(--nav-height);
          background: var(--card);
          border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
          box-shadow: 0 -4px 14px rgba(15, 23, 42, 0.08);
          display: flex;
          /* Carve a circular gap at top-center the size of the indicator's outer
             ring so the page shows through where the ring used to sit. */
          -webkit-mask-image: radial-gradient(circle var(--cutout-radius) at 50% 0%, transparent 99%, black 100%);
          mask-image: radial-gradient(circle var(--cutout-radius) at 50% 0%, transparent 99%, black 100%);
        }

        .rm-bottom-nav .navigation ul {
          position: relative;
          display: flex;
          width: 100%;
          margin: 0;
          padding: 0;
        }

        .rm-bottom-nav .navigation ul li {
          position: relative;
          list-style: none;
          flex: 1 1 0;
          height: var(--nav-height);
          z-index: 1;
        }

        .rm-bottom-nav .navigation ul li .nav-button {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 100%;
          height: 100%;
          gap: 4px;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: center;
          font-weight: 500;
          text-decoration: none;
          padding: 8px 4px;
        }

        .rm-bottom-nav .navigation ul li .nav-button .icon {
          line-height: 1;
          transition: transform 0.3s, color 0.3s;
          color: var(--muted-foreground);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .rm-bottom-nav .navigation ul li .nav-button .icon.icon-active {
          color: var(--primary);
        }

        .rm-bottom-nav .navigation ul li:hover .nav-button .icon {
          transform: translateY(-2px);
        }

        .rm-bottom-nav .navigation ul li .nav-button .text {
          color: var(--muted-foreground);
          font-size: 0.7rem;
          letter-spacing: 0.02em;
          line-height: 1;
          transition: color 0.3s;
        }

        .rm-bottom-nav .navigation ul li .nav-button .text.text-active {
          color: var(--primary);
          font-weight: 600;
        }

        /* Scanner-only: hide inline icon (indicator circle shows it instead) */
        .rm-bottom-nav .navigation ul li.is-scanner .nav-button .icon {
          opacity: 0;
        }

        /* The circular indicator is always pinned over the scanner (center) item */
        .rm-bottom-nav .indicator {
          position: absolute;
          top: calc(var(--indicator-size) / -2);
          left: 50%;
          transform: translateX(-50%);
          width: var(--indicator-size);
          height: var(--indicator-size);
          background: var(--card);
          /* Clip the white background to the inner padding box so the 6px outer
             band stays truly transparent and the navbar cutout shows through. */
          background-clip: padding-box;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
          pointer-events: auto;
        }

        .rm-bottom-nav .indicator .indicator-icon {
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          z-index: 2;
        }

      `}</style>

      <div className="navigation-shell">
        <div className="navigation">
          <ul>
            {navItems.map(({ label, Icon, path }, index) => {
              const active = isActive(path)
              const isScanner = index === SCANNER_INDEX
              return (
                <li key={label} className={`list ${isScanner ? "is-scanner" : ""}`}>
                  <Link href={path} className="nav-button" aria-current={active ? "page" : undefined}>
                    <span className={`icon ${active ? "icon-active" : ""}`}>
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className={`text ${active && !isScanner ? "text-active" : ""}`}>
                      {label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Indicator must be a sibling of `.navigation` (NOT inside it) so the
            mask cutout on `.navigation` doesn't clip the scanner button. */}
        <Link href="/scan" className="indicator" aria-label="Scanner">
          <span className="indicator-icon">
            <ScanLine size={24} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </nav>
  )
}
