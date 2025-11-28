"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QrScanner } from "@/components/qr/qr-scanner"

export default function ScanPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scan Attendance</h1>
          <p className="text-muted-foreground">Use your mobile device to scan the QR code</p>
        </div>
        <QrScanner />
      </div>
    </DashboardLayout>
  )
}
