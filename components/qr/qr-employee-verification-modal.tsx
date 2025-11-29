"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

interface QrEmployeeVerificationModalProps {
  open: boolean
  qrToken: string | null
  onOpenChange: (open: boolean) => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function QrEmployeeVerificationModal({
  open,
  qrToken,
  onOpenChange,
  onSuccess,
  onError,
}: QrEmployeeVerificationModalProps) {
  const [employeeCode, setEmployeeCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "verifying" | "gettingLocation" | "submitting">("idle")
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string
    email: string
    employeeCode: string
  } | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const handleVerifyEmployee = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeCode.trim()) {
      onError("Please enter employee code")
      return
    }

    if (!qrToken) {
      onError("Invalid QR token")
      return
    }

    setLoading(true)
    setStatus("verifying")

    try {
      const verifyResponse = await apiClient.post("/api/employees/by-code", {
        employeeCode: employeeCode.trim(),
      })

      if (!verifyResponse.employee) {
        throw new Error("Employee not found")
      }

      setEmployeeInfo(verifyResponse.employee)

      setStatus("gettingLocation")
      await getEmployeeLocation()
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      setEmployeeCode("")
      onError(error instanceof Error ? error.message : "Failed to verify employee")
    }
  }

  const getEmployeeLocation = async () => {
    return new Promise<void>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
            resolve()
          },
          (error) => {
            console.warn("Geolocation error:", error)
            resolve()
          },
        )
      } else {
        resolve()
      }
    })
  }

  const handleSubmitCheckIn = async () => {
    if (!qrToken || !employeeInfo || !employeeCode) {
      onError("Invalid request")
      return
    }

    setStatus("submitting")

    try {
      const deviceId = `device-${Date.now()}`

      const response = await apiClient.post("/api/attendance/check-in", {
        encryptedToken: qrToken,
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
      onOpenChange(false)
      onSuccess(response.message || "Attendance marked successfully!")
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      onError(error instanceof Error ? error.message : "Check-in failed")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEmployeeCode("")
      setEmployeeInfo(null)
      setLatitude(null)
      setLongitude(null)
      setStatus("idle")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Verification</DialogTitle>
        </DialogHeader>

        {!employeeInfo ? (
          <form onSubmit={handleVerifyEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <Input
                id="employeeCode"
                placeholder="Enter your employee code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && status === "verifying" ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Employee"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Employee:</span> {employeeInfo.name}
              </p>
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Code:</span> {employeeInfo.employeeCode}
              </p>
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Email:</span> {employeeInfo.email}
              </p>
            </div>

            {status === "gettingLocation" && (
              <div className="flex items-center justify-center rounded-lg bg-yellow-50 p-4">
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                <p className="text-sm text-yellow-900">Getting location...</p>
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-900">
                  Location captured: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </p>
              </div>
            )}

            {latitude === null && longitude === null && status !== "gettingLocation" && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-900">Location not available, but check-in can proceed</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEmployeeInfo(null)
                  setEmployeeCode("")
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitCheckIn}
                disabled={loading || status === "gettingLocation"}
              >
                {loading && status === "submitting" ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Check-in"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
