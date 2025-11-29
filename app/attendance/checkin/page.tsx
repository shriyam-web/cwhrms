"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle, Loader, MapPin, Clock } from "lucide-react"

function CheckinContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [employeeCode, setEmployeeCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "verifying" | "gettingLocation" | "submitting">("idle")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string
    email: string
    employeeCode: string
  } | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleVerifyEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeCode.trim()) {
      setMessage("Please enter employee code")
      setMessageType("error")
      return
    }

    if (!token) {
      setMessage("Invalid QR token")
      setMessageType("error")
      return
    }

    setLoading(true)
    setStatus("verifying")
    setMessage("")
    setMessageType(null)

    try {
      const verifyResponse = await apiClient.post("/api/employees/by-code", {
        employeeCode: employeeCode.trim(),
      })

      if (!verifyResponse.employee) {
        throw new Error("Employee not found")
      }

      setEmployeeInfo(verifyResponse.employee)
      setStatus("gettingLocation")
      await getLocation()
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      setMessage(error instanceof Error ? error.message : "Failed to verify employee")
      setMessageType("error")
    }
  }

  const getLocation = async () => {
    return new Promise<void>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
            setStatus("submitting")
            resolve()
          },
          (error) => {
            console.warn("Geolocation error:", error)
            setStatus("submitting")
            resolve()
          },
        )
      } else {
        setStatus("submitting")
        resolve()
      }
    })
  }

  const handleSubmitCheckIn = async () => {
    if (!token || !employeeInfo || !employeeCode) {
      setMessage("Invalid request")
      setMessageType("error")
      return
    }

    try {
      const deviceId = `device-${Date.now()}`

      const response = await apiClient.post("/api/attendance/check-in-public", {
        encryptedToken: token,
        employeeCode: employeeCode.trim(),
        deviceId,
        latitude,
        longitude,
      })

      setLoading(false)
      setStatus("idle")
      setEmployeeCode("")
      setEmployeeInfo(null)
      setLatitude(null)
      setLongitude(null)
      setToken(null)
      setMessage(response.message || "Attendance marked successfully!")
      setMessageType("success")

      setTimeout(() => {
        setEmployeeCode("")
        setMessage("")
        setMessageType(null)
      }, 3000)
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      setEmployeeInfo(null)
      setMessage(error instanceof Error ? error.message : "Check-in failed")
      setMessageType("error")
    }
  }

  const handleBack = () => {
    setEmployeeInfo(null)
    setEmployeeCode("")
    setLatitude(null)
    setLongitude(null)
    setStatus("idle")
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

        {!employeeInfo ? (
          <form onSubmit={handleVerifyEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code (e.g., CW/ABC-1234)</Label>
              <Input
                id="employeeCode"
                placeholder="Enter your employee code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading && status === "verifying" ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Employee:</span> {employeeInfo.name}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">Code:</span> {employeeInfo.employeeCode}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                <span className="font-semibold">Email:</span> {employeeInfo.email}
              </p>
            </div>

            {status === "gettingLocation" && (
              <div className="flex items-center justify-center rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <Loader className="mr-2 h-4 w-4 animate-spin text-yellow-600" />
                <p className="text-sm text-yellow-900">Getting location...</p>
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <div className="flex gap-2 rounded-lg bg-green-50 border border-green-200 p-4">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                <div className="text-sm text-green-900">
                  <p className="font-semibold">Location Captured</p>
                  <p className="text-xs mt-1">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                </div>
              </div>
            )}

            {latitude === null && longitude === null && status !== "gettingLocation" && (
              <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-4">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-1" />
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Location unavailable</span> - Proceeding without location data
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitCheckIn}
                disabled={loading || status === "gettingLocation"}
              >
                {loading && status === "submitting" ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Confirm Check-in
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </div>
        )}
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
