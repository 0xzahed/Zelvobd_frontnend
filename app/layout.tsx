import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Zelvobd — Shop smarter, faster",
  description:
    "Zelvobd is a modern mobile-first eCommerce experience with flash sales, daily deals, and free delivery on orders above ৳500.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#306FD7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} bg-card`}>
      <body className="font-sans antialiased bg-card text-foreground" suppressHydrationWarning>
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
