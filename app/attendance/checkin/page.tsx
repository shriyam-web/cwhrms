"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader, Clock } from "lucide-react"
import { getISTNow } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

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
  const [statusDisplay, setStatusDisplay] = useState<"early" | "ontime" | "latewindow" | "late" | null>(null)
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [todayCheckInTime, setTodayCheckInTime] = useState<Date | null>(null)
  const [totalHours, setTotalHours] = useState<number>(0)

  const CHECKIN_TIME = 10 * 60
  const HALF_DAY_THRESHOLD = 11 * 60
  const CHECKOUT_EARLY_TIME = 18 * 60 + 25
  const CHECKOUT_TIME = 18 * 60 + 30
  const GRACE_PERIOD = 15

  const getAttendanceStatus = () => {
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

    if (attendanceType === "checkin") {
      if (minutes < CHECKIN_TIME) return "ontime"
      if (minutes <= CHECKIN_TIME + GRACE_PERIOD) return "latewindow"
      return "late"
    } else {
      if (minutes < CHECKOUT_EARLY_TIME) return "early"
      if (minutes <= CHECKOUT_TIME) return "ontime"
      if (minutes <= CHECKOUT_TIME + GRACE_PERIOD) return "latewindow"
      return "late"
    }
  }

  const shouldShowHalfDayToggle = () => {
    if (attendanceType !== "checkin") return false
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
    return minutes >= HALF_DAY_THRESHOLD
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
          console.log("[Init] Today's check-in time fetched:", data.checkInTime)
        }
      }
    } catch (error) {
      console.error("[Init] Error fetching today's check-in time:", error)
    }
  }

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
      console.log("[Init] QR token received from URL")
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

    const currentStatus = getAttendanceStatus()
    if (currentStatus === "late") {
      setMessage(
        attendanceType === "checkin" ? "You are late for check-in" : "You are late for check-out"
      )
      setMessageType("error")
    } else if (currentStatus === "latewindow") {
      setMessage(
        attendanceType === "checkin"
          ? "You are in the late window (15 min grace period)"
          : "You are in the late window (15 min grace period)"
      )
      setMessageType("warning")
    }

    setLoading(true)

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
      if (attendanceType === "checkin" && isHalfDay) payload.isHalfDay = true

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

        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Current Time</span>
            <span className="text-lg font-mono font-bold text-gray-900">
              {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Status</span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                statusDisplay === "ontime"
                  ? "bg-green-100 text-green-800"
                  : statusDisplay === "latewindow"
                    ? "bg-yellow-100 text-yellow-800"
                    : statusDisplay === "early"
                      ? "bg-red-100 text-red-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              {statusDisplay === "ontime"
                ? "On Time"
                : statusDisplay === "latewindow"
                  ? "Late Window"
                  : statusDisplay === "early"
                    ? "Too Early"
                    : "Late"}
            </span>
          </div>
          
          {attendanceType === "checkout" && todayCheckInTime && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-300">
              <span className="text-sm font-semibold text-gray-700">Total Hours</span>
              <span
                className={`text-lg font-bold px-3 py-1 rounded-full ${
                  isLessThanRequired()
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {formatTotalHours(totalHours)}
              </span>
            </div>
          )}
        </div>

        {messageType && (
          <div
            className={`flex gap-3 rounded-lg p-4 mb-6 ${
              messageType === "success"
                ? "bg-green-50 text-green-900"
                : messageType === "warning"
                  ? "bg-yellow-50 text-yellow-900"
                  : "bg-red-50 text-red-900"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : messageType === "warning" ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmitAttendance} className="space-y-4">
          <div className="space-y-3">
            <Label>Attendance Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attendanceType"
                  value="checkin"
                  checked={attendanceType === "checkin"}
                  onChange={(e) => setAttendanceType(e.target.value as "checkin" | "checkout")}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm">Check In</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attendanceType"
                  value="checkout"
                  checked={attendanceType === "checkout"}
                  onChange={(e) => setAttendanceType(e.target.value as "checkin" | "checkout")}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm">Check Out</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeCode">Employee Code</Label>
            <Input
              id="employeeCode"
              placeholder="e.g., CW/XXX-DDMM"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </div>

          {shouldShowHalfDayToggle() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="halfDay"
                  checked={isHalfDay}
                  onCheckedChange={(checked) => setIsHalfDay(checked as boolean)}
                  disabled={loading}
                />
                <label htmlFor="halfDay" className="flex-1 cursor-pointer text-sm">
                  <span className="font-semibold text-blue-900">Mark as Half Day</span>
                  <p className="text-xs text-blue-700 mt-1">You are checking in after 11:00 AM</p>
                </label>
              </div>
            </div>
          )}

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
