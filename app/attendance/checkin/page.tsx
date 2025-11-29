"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader, Clock } from "lucide-react"

function CheckinContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [employeeCode, setEmployeeCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string
    email: string
    employeeCode: string
  } | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      console.log("[Init] QR token received from URL")
    }
  }, [searchParams])

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[Submit] Starting attendance submission")

    if (!employeeCode.trim()) {
      setMessage("Enter employee code")
      setMessageType("error")
      return
    }

    if (!token) {
      setMessage("No QR token found")
      setMessageType("error")
      return
    }

    setLoading(true)
    setMessage("")
    setMessageType(null)

    try {
      console.log("[Submit] Getting location...")
      let latitude = null
      let longitude = null

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude
              longitude = position.coords.longitude
              console.log("[Submit] Location obtained:", latitude, longitude)
              resolve()
            },
            () => {
              console.log("[Submit] Location permission denied, continuing without location")
              resolve()
            },
            { timeout: 5000, enableHighAccuracy: false }
          )
        })
      }

      const payload = {
        encryptedToken: token,
        employeeCode: employeeCode.trim(),
        deviceId: `device-${Date.now()}`,
        clientTime: new Date().toISOString(),
        timezoneOffset: new Date().getTimezoneOffset(),
      } as any

      if (latitude !== null) payload.latitude = latitude
      if (longitude !== null) payload.longitude = longitude

      console.log("[Submit] Sending to API:", payload)

      const response = await fetch("/api/attendance/check-in-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("[Submit] Response status:", response.status)
      console.log("[Submit] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Check-in failed")
      }

      setLoading(false)
      setMessage(data.message || "Attendance recorded successfully!")
      setMessageType("success")
      setEmployeeCode("")
      setEmployeeInfo(null)
      setToken(null)

      setTimeout(() => {
        setMessage("")
        setMessageType(null)
      }, 3000)
    } catch (error) {
      console.error("[Submit] Error:", error)
      setLoading(false)
      setMessage(error instanceof Error ? error.message : "Failed to record attendance")
      setMessageType("error")
    }
  }

  const handleReset = () => {
    setEmployeeCode("")
    setEmployeeInfo(null)
    setMessage("")
    setMessageType(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Enter your employee code</p>
        </div>

        {messageType && (
          <div
            className={`flex gap-3 rounded-lg p-4 mb-6 ${
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

        <form onSubmit={handleSubmitAttendance} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeCode">Employee Code</Label>
            <Input
              id="employeeCode"
              placeholder="e.g., CW/GNO-2707"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Mark Attendance
              </>
            )}
          </Button>

          {employeeCode && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleReset}
              disabled={loading}
            >
              Clear
            </Button>
          )}
        </form>
      </Card>
    </div>
  )
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="w-full max-w-md p-8">
            <div className="flex items-center justify-center gap-2">
              <Loader className="h-5 w-5 animate-spin" />
              <p>Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <CheckinContent />
    </Suspense>
  )
}
