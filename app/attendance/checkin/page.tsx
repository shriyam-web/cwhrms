"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader, Clock, LogOut, Zap } from "lucide-react"
import { getISTNow } from "@/lib/utils"

interface AttendanceStatus {
  status: "appreciated" | "ontime" | "grace" | "early" | "incomplete"
  label: string
  color: "purple" | "green" | "amber" | "red" | "blue"
}

function CheckinContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [employeeCode, setEmployeeCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | null>(null)
  const [employeeInfo, setEmployeeInfo] = useState<{
    name: string
    email: string
    employeeCode: string
  } | null>(null)
  const [attendanceType, setAttendanceType] = useState<"checkin" | "checkout">("checkin")
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [statusDisplay, setStatusDisplay] = useState<AttendanceStatus | null>(null)
  const [todayCheckInTime, setTodayCheckInTime] = useState<Date | null>(null)
  const [totalHours, setTotalHours] = useState<number>(0)

  const CHECKIN_TIME = 10 * 60
  const CHECKOUT_EARLY_TIME = 18 * 60 + 15
  const CHECKOUT_GRACE_TIME = 18 * 60 + 25
  const CHECKOUT_ONTIME_TIME = 19 * 60
  const CHECKIN_GRACE_PERIOD = 15

  const getCheckInStatus = (): AttendanceStatus => {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const parts = formatter.formatToParts(now)
    const hours = Number(parts.find(p => p.type === 'hour')?.value || 0)
    const mins = Number(parts.find(p => p.type === 'minute')?.value || 0)
    const minutes = hours * 60 + mins

    if (minutes < CHECKIN_TIME) {
      return { status: "appreciated", label: "🌟 Before 10:00 AM (Appreciated)", color: "purple" }
    } else if (minutes <= CHECKIN_TIME + CHECKIN_GRACE_PERIOD) {
      return { status: "grace", label: "⏰ 10:00-10:15 AM (Grace)", color: "amber" }
    } else {
      return { status: "early", label: "⚠️ After 10:15 AM (Late)", color: "red" }
    }
  }

  const getCheckOutStatus = (): AttendanceStatus => {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const parts = formatter.formatToParts(now)
    const hours = Number(parts.find(p => p.type === 'hour')?.value || 0)
    const mins = Number(parts.find(p => p.type === 'minute')?.value || 0)
    const minutes = hours * 60 + mins

    if (minutes < CHECKOUT_EARLY_TIME) {
      return { status: "incomplete", label: "⚠️ Before 6:15 PM (Early)", color: "red" }
    } else if (minutes < CHECKOUT_GRACE_TIME) {
      return { status: "grace", label: "⏰ 6:15-6:25 PM (Grace)", color: "amber" }
    } else if (minutes < CHECKOUT_ONTIME_TIME) {
      return { status: "ontime", label: "✓ 6:25-7:00 PM (Standard)", color: "green" }
    } else {
      return { status: "appreciated", label: "⭐ After 7:00 PM (Extra Effort!)", color: "purple" }
    }
  }

  const getAttendanceStatus = (): AttendanceStatus => {
    return attendanceType === "checkin" ? getCheckInStatus() : getCheckOutStatus()
  }

  const formatTotalHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const isLessThanRequired = () => {
    return totalHours < 8.5
  }

  const fetchTodayCheckInTime = async () => {
    try {
      const response = await fetch("/api/attendance/today-checkin")
      if (response.ok) {
        const data = await response.json()
        if (data.checkInTime) {
          setTodayCheckInTime(new Date(data.checkInTime))
        }
      }
    } catch (error) {
      console.error("Error fetching today's check-in time:", error)
    }
  }

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
    fetchTodayCheckInTime()
  }, [searchParams])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setStatusDisplay(getAttendanceStatus())
    }, 1000)

    return () => clearInterval(timer)
  }, [attendanceType])

  useEffect(() => {
    if (todayCheckInTime && attendanceType === "checkout") {
      const timeDifference = currentTime.getTime() - todayCheckInTime.getTime()
      const hours = timeDifference / (1000 * 60 * 60)
      setTotalHours(hours)
    }
  }, [currentTime, todayCheckInTime, attendanceType])

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault()

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

    try {
      let latitude = null
      let longitude = null

      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              latitude = position.coords.latitude
              longitude = position.coords.longitude
              resolve()
            },
            () => {
              resolve()
            },
            { timeout: 5000, enableHighAccuracy: false }
          )
        })
      }

      const istTime = getISTNow()

      const payload = {
        encryptedToken: token,
        employeeCode: employeeCode.trim(),
        deviceId: `device-${Date.now()}`,
        checkTime: istTime.toISOString(),
        type: attendanceType,
      } as any

      if (latitude !== null) payload.latitude = latitude
      if (longitude !== null) payload.longitude = longitude

      const response = await fetch("/api/attendance/check-in-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to record attendance")
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

  const getStatusColor = (color: string) => {
    switch (color) {
      case "purple":
        return "from-purple-50 to-pink-50 border-purple-200 text-purple-900"
      case "green":
        return "from-green-50 to-emerald-50 border-green-200 text-green-900"
      case "amber":
        return "from-amber-50 to-orange-50 border-amber-200 text-amber-900"
      case "red":
        return "from-red-50 to-pink-50 border-red-200 text-red-900"
      case "blue":
        return "from-blue-50 to-cyan-50 border-blue-200 text-blue-900"
      default:
        return "from-slate-50 to-gray-50 border-slate-200 text-slate-900"
    }
  }

  const getStatusBgColor = (color: string) => {
    switch (color) {
      case "purple":
        return "bg-purple-100"
      case "green":
        return "bg-green-100"
      case "amber":
        return "bg-amber-100"
      case "red":
        return "bg-red-100"
      case "blue":
        return "bg-blue-100"
      default:
        return "bg-slate-100"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-8 py-6 rounded-t-lg">
          <h1 className="text-4xl font-bold">Mark Attendance</h1>
          <p className="text-blue-200 mt-1">Scan QR or enter your employee code</p>
        </div>

        <div className="p-8 space-y-6">
          {messageType && (
            <div
              className={`flex gap-3 rounded-lg p-4 ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-900"
                  : messageType === "warning"
                    ? "bg-yellow-50 border border-yellow-200 text-yellow-900"
                    : "bg-red-50 border border-red-200 text-red-900"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className={`bg-gradient-to-br ${getStatusColor(statusDisplay?.color || "blue")} border rounded-lg p-4`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-75">Current Time (IST)</span>
                  <span className="text-2xl font-mono font-bold">
                    {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-current border-opacity-20">
                  <span className="text-sm font-medium opacity-75">Status</span>
                  <span className={`text-base font-bold px-3 py-1 rounded-full ${getStatusBgColor(statusDisplay?.color || "blue")}`}>
                    {statusDisplay?.label || "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  {attendanceType === "checkin" ? "📋 Check-In Guidelines" : "🎯 Check-Out Guidelines"}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {attendanceType === "checkin" ? (
                    <>
                      <div className="bg-purple-100 p-2 rounded border border-purple-200">
                        <p className="font-medium text-purple-800">🌟 Before 10 AM</p>
                        <p className="text-purple-700 mt-1">Appreciated</p>
                      </div>
                      <div className="bg-amber-100 p-2 rounded border border-amber-200">
                        <p className="font-medium text-amber-800">⏰ 10:00-10:15</p>
                        <p className="text-amber-700 mt-1">Grace Period</p>
                      </div>
                      <div className="bg-red-100 p-2 rounded border border-red-200 col-span-2">
                        <p className="font-medium text-red-800">⚠️ After 10:15 AM</p>
                        <p className="text-red-700 mt-1">Late</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-100 p-2 rounded border border-red-200">
                        <p className="font-medium text-red-800">⚠️ Before 6:15</p>
                        <p className="text-red-700 mt-1">Incomplete</p>
                      </div>
                      <div className="bg-amber-100 p-2 rounded border border-amber-200">
                        <p className="font-medium text-amber-800">⏰ 6:15-6:25</p>
                        <p className="text-amber-700 mt-1">Grace</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded border border-green-200">
                        <p className="font-medium text-green-800">✓ 6:25-7:00</p>
                        <p className="text-green-700 mt-1">Standard</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded border border-purple-200">
                        <p className="font-medium text-purple-800">⭐ After 7:00</p>
                        <p className="text-purple-700 mt-1">Extra Effort!</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {attendanceType === "checkout" && todayCheckInTime && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">Total Hours</span>
                <span
                  className={`text-xl font-bold px-4 py-2 rounded-lg ${
                    isLessThanRequired()
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {formatTotalHours(totalHours)}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Attendance Type</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendanceType("checkin")}
                    disabled={loading}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      attendanceType === "checkin"
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Check In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceType("checkout")}
                    disabled={loading}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      attendanceType === "checkout"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Check Out
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCode" className="text-base font-semibold">Employee Code *</Label>
                <Input
                  id="employeeCode"
                  placeholder="e.g., CW/XXX-DDMM"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="text-center text-lg tracking-widest font-mono font-bold"
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-lg font-semibold" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  {attendanceType === "checkin" ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Mark Check In
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Mark Check Out
                    </>
                  )}
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
        </div>
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
