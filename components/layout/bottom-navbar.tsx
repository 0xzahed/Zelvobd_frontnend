"use client"

import { Home } from "lucide-react"
import { BiSolidOffer } from "react-icons/bi"
import { FiMenu } from "react-icons/fi"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavbar() {
  const pathname = usePathname()

  const navItems = [
    { label: "Home", Icon: Home, path: "/" },
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
        }

        @media (min-width: 380px) {
          .rm-bottom-nav {
            --nav-height: 70px;
          }
        }

        .rm-bottom-nav * {
          box-sizing: border-box;
        }

        .rm-bottom-nav .navigation {
          position: relative;
          width: 100%;
          height: var(--nav-height);
          background: var(--card);
          border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
          box-shadow: 0 -4px 14px rgba(15, 23, 42, 0.08);
          display: flex;
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
      `}</style>

      <div className="navigation">
        <ul>
          {navItems.map(({ label, Icon, path }) => {
            const active = isActive(path)
            return (
              <li key={label} className="list">
                <Link href={path} className="nav-button" aria-current={active ? "page" : undefined}>
                  <span className={`icon ${active ? "icon-active" : ""}`}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className={`text ${active ? "text-active" : ""}`}>
                    {label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
