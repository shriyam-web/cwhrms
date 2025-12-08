"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, CheckCircle, Loader, Clock, LogOut, Zap } from "lucide-react"

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
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimeInIST = (date: Date): string => {
    return date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    })
  }

  const getCheckoutGuidelineStatus = (time: Date): string => {
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const timeInMinutes = hours * 60 + minutes

    const CHECKOUT_EARLY_TIME = 18 * 60 + 15
    const CHECKOUT_GRACE_TIME = 18 * 60 + 25
    const CHECKOUT_ONTIME_TIME = 19 * 60

    if (timeInMinutes < CHECKOUT_EARLY_TIME) return "early"
    if (timeInMinutes < CHECKOUT_GRACE_TIME) return "grace"
    if (timeInMinutes < CHECKOUT_ONTIME_TIME) return "ontime"
    return "appreciated"
  }

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
        const timeoutId = setTimeout(() => {
          console.warn("[QR Modal] Geolocation timeout after 15 seconds")
          resolve()
        }, 15000)
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId)
            setLatitude(position.coords.latitude)
            setLongitude(position.coords.longitude)
            console.log("[QR Modal] Geolocation obtained:", { latitude: position.coords.latitude, longitude: position.coords.longitude })
            resolve()
          },
          (error) => {
            clearTimeout(timeoutId)
            console.warn("[QR Modal] Geolocation error:", error.code, error.message)
            resolve()
          },
          { timeout: 12000, enableHighAccuracy: false, maximumAge: 0 }
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
      setIsCheckingOut(false)
      onOpenChange(false)
      onSuccess(response.message || "Check-in marked successfully!")
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      onError(error instanceof Error ? error.message : "Check-in failed")
    }
  }

  const handleSubmitCheckOut = async () => {
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
        isCheckOut: true,
        latitude,
        longitude,
      })

      setLoading(false)
      setStatus("idle")
      setEmployeeCode("")
      setEmployeeInfo(null)
      setLatitude(null)
      setLongitude(null)
      setIsCheckingOut(false)
      onOpenChange(false)
      onSuccess(response.message || "Check-out marked successfully!")
    } catch (error) {
      setLoading(false)
      setStatus("idle")
      onError(error instanceof Error ? error.message : "Check-out failed")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEmployeeCode("")
      setEmployeeInfo(null)
      setLatitude(null)
      setLongitude(null)
      setStatus("idle")
      setIsCheckingOut(false)
      setAttendanceRecord(null)
    }
    onOpenChange(newOpen)
  }

  const checkoutGuidelineStatus = getCheckoutGuidelineStatus(currentTime)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Mark Attendance</DialogTitle>
        </DialogHeader>

        {!employeeInfo ? (
          <form onSubmit={handleVerifyEmployee} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeCode" className="text-base font-medium">Employee Code *</Label>
              <Input
                id="employeeCode"
                placeholder="Enter your employee code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="text-lg py-2"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full py-2 text-base" disabled={loading}>
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
          <div className="space-y-5">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-200">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{employeeInfo.name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Code: <span className="font-mono font-semibold text-slate-700">{employeeInfo.employeeCode}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Time: <span className="font-mono font-semibold text-slate-700">{formatTimeInIST(currentTime)} IST</span>
                </p>
              </div>
            </div>

            {status === "gettingLocation" && (
              <div className="flex items-center justify-center rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                <Loader className="mr-2 h-4 w-4 animate-spin text-yellow-600" />
                <p className="text-sm text-yellow-800">Capturing location...</p>
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-900">Location Captured</p>
                  <p className="text-xs text-green-700 font-mono">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                </div>
              </div>
            )}

            {latitude === null && longitude === null && status !== "gettingLocation" && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800"><span className="font-medium">Note:</span> Location unavailable, but check-in/out can proceed</p>
              </div>
            )}

            {!isCheckingOut && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2 mb-3">
                  <Clock className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-purple-900 mb-2">📋 Check-In Guidelines</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded border border-purple-100">
                        <p className="font-medium text-purple-700">🌟 Before 10:00 AM</p>
                        <p className="text-slate-600 mt-0.5">Appreciated</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-green-100">
                        <p className="font-medium text-green-700">✓ At 10:00 AM</p>
                        <p className="text-slate-600 mt-0.5">Perfect</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-amber-100">
                        <p className="font-medium text-amber-700">⏰ 10:01-10:15 AM</p>
                        <p className="text-slate-600 mt-0.5">Grace Period</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-red-100">
                        <p className="font-medium text-red-700">⚠️ After 10:15 AM</p>
                        <p className="text-slate-600 mt-0.5">Late</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCheckingOut && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2 mb-3">
                  <LogOut className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="w-full">
                    <p className="text-xs font-semibold text-blue-900 mb-2">🎯 Check-Out Guidelines</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded border ${checkoutGuidelineStatus === "early" ? "bg-red-100 border-red-300" : "bg-white border-red-100"}`}>
                        <p className={`font-medium ${checkoutGuidelineStatus === "early" ? "text-red-800" : "text-red-700"}`}>⚠️ Before 6:15 PM</p>
                        <p className={`${checkoutGuidelineStatus === "early" ? "text-red-700" : "text-slate-600"} mt-0.5`}>Incomplete Hours</p>
                      </div>
                      <div className={`p-2 rounded border ${checkoutGuidelineStatus === "grace" ? "bg-amber-100 border-amber-300" : "bg-white border-amber-100"}`}>
                        <p className={`font-medium ${checkoutGuidelineStatus === "grace" ? "text-amber-800" : "text-amber-700"}`}>⏰ 6:15-6:25 PM</p>
                        <p className={`${checkoutGuidelineStatus === "grace" ? "text-amber-700" : "text-slate-600"} mt-0.5`}>Grace Period</p>
                      </div>
                      <div className={`p-2 rounded border ${checkoutGuidelineStatus === "ontime" ? "bg-green-100 border-green-300" : "bg-white border-green-100"}`}>
                        <p className={`font-medium ${checkoutGuidelineStatus === "ontime" ? "text-green-800" : "text-green-700"}`}>✓ 6:25-7:00 PM</p>
                        <p className={`${checkoutGuidelineStatus === "ontime" ? "text-green-700" : "text-slate-600"} mt-0.5`}>Standard Hours</p>
                      </div>
                      <div className={`p-2 rounded border ${checkoutGuidelineStatus === "appreciated" ? "bg-purple-100 border-purple-300" : "bg-white border-purple-100"}`}>
                        <p className={`font-medium ${checkoutGuidelineStatus === "appreciated" ? "text-purple-800" : "text-purple-700"}`}>⭐ After 7:00 PM</p>
                        <p className={`${checkoutGuidelineStatus === "appreciated" ? "text-purple-700" : "text-slate-600"} mt-0.5`}>Extra Effort!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEmployeeInfo(null)
                  setEmployeeCode("")
                  setIsCheckingOut(false)
                }}
              >
                Back
              </Button>
              {!isCheckingOut ? (
                <>
                  <Button
                    onClick={() => setIsCheckingOut(true)}
                    className="flex-1"
                    variant="outline"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                  <Button
                    onClick={handleSubmitCheckIn}
                    disabled={loading || status === "gettingLocation"}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading && status === "submitting" ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Check In
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsCheckingOut(false)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                  <Button
                    onClick={handleSubmitCheckOut}
                    disabled={loading || status === "gettingLocation"}
                    className={`flex-1 ${checkoutGuidelineStatus === "appreciated" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {loading && status === "submitting" ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Check Out
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
