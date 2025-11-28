"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QrDisplay } from "@/components/qr/qr-display"

export default function QrDisplayPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">QR Code Display</h1>
          <p className="text-muted-foreground">Display this on a screen for employees to scan</p>
        </div>
        <QrDisplay />
      </div>
    </DashboardLayout>
  )
}
