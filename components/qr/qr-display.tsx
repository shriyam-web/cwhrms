"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function QrDisplay() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState(45)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateQR = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<any>("/api/attendance/generate-qr", {})
      setQrCode(response.qrCode)
      setExpiresIn(45)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate QR code"
      console.error("Failed to generate QR code:", error)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateQR()
    const interval = setInterval(() => {
      generateQR()
    }, 45000) // Rotate every 45 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (expiresIn <= 0) {
      generateQR()
      return
    }

    const timer = setTimeout(() => {
      setExpiresIn((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [expiresIn])

  return (
    <Card className="p-8 flex flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Attendance QR Code</h2>
        <p className="text-muted-foreground">Scan with your mobile device</p>
      </div>

      {loading && (
        <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground">Loading QR code...</p>
        </div>
      )}

      {error && (
        <div className="w-full bg-destructive/10 text-destructive rounded-lg p-4 text-center">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {qrCode && !loading && (
        <div className="relative w-64 h-64">
          <Image src={qrCode} alt="Attendance QR Code" fill className="object-contain" />
        </div>
      )}

      {!error && (
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{expiresIn}</div>
          <p className="text-sm text-muted-foreground">seconds until refresh</p>
        </div>
      )}

      <Button
        onClick={() => generateQR()}
        disabled={loading}
        className="gap-2"
      >
        <RotateCw className="h-4 w-4" />
        Regenerate QR
      </Button>

      <div className="w-full bg-muted rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">QR Code rotates every 45 seconds for security</p>
      </div>
    </Card>
  )
}
