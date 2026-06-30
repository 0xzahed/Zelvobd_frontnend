"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"

export default function TermsPage() {
  return (
    <AppShell>
      <BackHeader title="Terms & Conditions" />

      <div className="mx-auto max-w-md space-y-5 py-2 pb-8 text-sm text-muted-foreground leading-relaxed">
        <p>
          Welcome to Zelvobd. By accessing and using our website, you agree to comply with the following Terms and Conditions.
        </p>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Orders & Payments</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>All orders are subject to availability and confirmation.</li>
            <li>Prices listed are in Bangladeshi Taka (BDT) and include applicable taxes.</li>
            <li>Cash on Delivery (COD) and online payments are accepted.</li>
            <li>Orders must be confirmed by our team before processing.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Delivery</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Delivery takes 24 hours to 3 days depending on location.</li>
            <li>Delivery charges may apply based on location and order value.</li>
            <li>We are not responsible for delays caused by natural disasters or courier issues.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Returns & Refunds</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Damaged or wrong products must be reported within 48 hours of delivery.</li>
            <li>Products must be unused and in original packaging for returns.</li>
            <li>Refunds will be processed within 7-14 business days after approval.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Product Information</h3>
          <p>
            We strive to provide accurate product descriptions and images. However, slight variations in color or appearance may occur due to screen settings.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Account Responsibility</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Changes to Terms</h3>
          <p>
            We reserve the right to update these Terms and Conditions at any time. Continued use of the website constitutes acceptance of the updated terms.
          </p>
        </div>

        <p>
          For any questions regarding these terms, please contact our support team.
        </p>
      </div>
    </AppShell>
  )
}
