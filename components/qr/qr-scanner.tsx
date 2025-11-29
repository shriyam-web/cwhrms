"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle } from "lucide-react"
import { QrEmployeeVerificationModal } from "./qr-employee-verification-modal"

interface QrScannerProps {
  initialToken?: string | null
}

export function QrScanner({ initialToken }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [scannedToken, setScannedToken] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")

  useEffect(() => {
    if (initialToken) {
      setScannedToken(initialToken)
      setModalOpen(true)
    }
  }, [initialToken])

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

  const handleManualScan = (token: string) => {
    if (!token.trim()) {
      return
    }
    setMessage("")
    setMessageType(null)
    setScannedToken(token.trim())
    setInputValue("")
    setModalOpen(true)
  }

  const handleModalSuccess = (message: string) => {
    setMessageType("success")
    setMessage(message)
    setScannedToken(null)
    setModalOpen(false)
  }

  const handleModalError = (errorMessage: string) => {
    setMessageType("error")
    setMessage(errorMessage)
    setScannedToken(null)
    setModalOpen(false)
  }

  return (
    <>
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
            ref={inputRef}
            type="text"
            placeholder="Paste QR token here"
            value={inputValue}
            onChange={(e) => {
              const text = e.target.value
              setInputValue(text)
              if (text.trim() && text.includes(":")) {
                handleManualScan(text)
              }
            }}
            onPaste={(e) => {
              e.preventDefault()
              const text = e.clipboardData.getData("text/plain")
              setInputValue(text)
              if (text.trim()) {
                handleManualScan(text)
              }
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && inputValue.trim()) {
                handleManualScan(inputValue)
              }
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

      <QrEmployeeVerificationModal
        open={modalOpen}
        qrToken={scannedToken}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />
    </>
  )
}
