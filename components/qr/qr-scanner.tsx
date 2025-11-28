"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle } from "lucide-react"

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!scanning) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          // Start scanning
          const interval = setInterval(() => {
            if (canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext("2d")
              if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
                // QR code detection would happen here with a library like jsQR
                // For now, we'll use manual input
              }
            }
          }, 100)

          return () => clearInterval(interval)
        }
      } catch (error) {
        setMessageType("error")
        setMessage("Failed to access camera")
      }
    }

    startCamera()
  }, [scanning])

  const handleManualScan = async (token: string) => {
    setLoading(true)
    setMessage("")
    setMessageType(null)

    try {
      // Get device ID
      const deviceId = `device-${Date.now()}`

      // Get GPS coordinates if available
      let latitude, longitude
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude
              longitude = pos.coords.longitude
              resolve(null)
            },
            () => resolve(null),
          )
        })
      }

      const response = await apiClient.post("/api/attendance/check-in", {
        encryptedToken: token,
        deviceId,
        latitude,
        longitude,
      })

      setMessageType("success")
      setMessage("Attendance marked successfully!")
    } catch (error) {
      setMessageType("error")
      setMessage(error instanceof Error ? error.message : "Check-in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Mark Attendance</h2>
        <p className="text-muted-foreground">Scan QR code or enter token</p>
      </div>

      {messageType && (
        <div
          className={`flex gap-3 rounded-lg p-4 ${
            messageType === "success" ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
          }`}
        >
          {messageType === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}

      {scanning && (
        <div className="space-y-4">
          <video ref={videoRef} className="w-full rounded-lg" style={{ maxHeight: "400px" }} />
          <canvas ref={canvasRef} className="hidden" width="400" height="300" />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Enter QR Token</label>
        <input
          type="text"
          placeholder="Paste QR token here"
          onPaste={(e) => {
            e.preventDefault()
            const text = e.clipboardData.getData("text/plain")
            handleManualScan(text)
          }}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex gap-2">
        <Button variant={scanning ? "destructive" : "default"} onClick={() => setScanning(!scanning)}>
          {scanning ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>
    </Card>
  )
}
