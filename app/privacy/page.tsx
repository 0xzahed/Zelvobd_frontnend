"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BackHeader } from "@/components/layout/back-header"

export default function PrivacyPage() {
  return (
    <AppShell>
      <BackHeader title="Privacy Policy" />

      <div className="mx-auto max-w-md space-y-5 py-2 pb-8 text-sm text-muted-foreground leading-relaxed">
        <p>
          At Zelvobd, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
        </p>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Information We Collect</h3>
          <p>
            We collect personal information such as your name, phone number, email address, and delivery address when you place an order or contact us.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">How We Use Your Information</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>To process and deliver your orders</li>
            <li>To communicate with you about your orders</li>
            <li>To improve our products and services</li>
            <li>To send promotional offers (only with your consent)</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal data from unauthorized access, alteration, or disclosure.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Third-Party Sharing</h3>
          <p>
            We do not sell or rent your personal information to third parties. We only share data with trusted delivery partners to fulfill your orders.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page.
          </p>
        </div>

        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </AppShell>
  )
}
