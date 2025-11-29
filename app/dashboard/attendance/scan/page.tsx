"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QrScanner } from "@/components/qr/qr-scanner"
import { useAuth } from "@/lib/use-auth"
import { AlertCircle } from "lucide-react"

export default function ScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && user && user.role !== "HR") {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || user.role !== "HR") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-6 text-red-900">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Access Denied</h3>
              <p className="text-sm">Only HR users can access attendance scanning.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scan Attendance</h1>
          <p className="text-muted-foreground">Use your mobile device to scan the QR code</p>
        </div>
        <QrScanner initialToken={token} />
      </div>
    </DashboardLayout>
  )
}
