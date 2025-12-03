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

  const handleScanAnother = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      
      const video = document.createElement("video")
      video.srcObject = stream
      video.setAttribute("autoplay", "true")
      video.setAttribute("playsinline", "true")
      video.style.position = "fixed"
      video.style.top = "0"
      video.style.left = "0"
      video.style.width = "100%"
      video.style.height = "100%"
      video.style.objectFit = "cover"
      video.style.zIndex = "9999"
      
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      document.body.appendChild(video)
      
      const scanInterval = setInterval(async () => {
        try {
          if (!ctx || !video.videoWidth) return
          
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          const response = await fetch("/api/scan-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              imageData: Array.from(data),
              width: canvas.width,
              height: canvas.height
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            if (result.token) {
              clearInterval(scanInterval)
              stream.getTracks().forEach(track => track.stop())
              if (document.body.contains(video)) document.body.removeChild(video)
              if (document.body.contains(closeButton)) document.body.removeChild(closeButton)
              
              setToken(result.token)
              setMessage("")
              setMessageType(null)
              setEmployeeCode("")
              
              if (typeof window !== "undefined") {
                window.history.replaceState({}, document.title, `?token=${encodeURIComponent(result.token)}`)
              }
            }
          }
        } catch (err) {
          console.error("Scan error:", err)
        }
      }, 100)
      
      const closeButton = document.createElement("button")
      closeButton.innerHTML = "✕"
      closeButton.style.position = "fixed"
      closeButton.style.top = "20px"
      closeButton.style.right = "20px"
      closeButton.style.width = "50px"
      closeButton.style.height = "50px"
      closeButton.style.fontSize = "28px"
      closeButton.style.zIndex = "10000"
      closeButton.style.backgroundColor = "rgba(0,0,0,0.7)"
      closeButton.style.color = "white"
      closeButton.style.border = "none"
      closeButton.style.borderRadius = "50%"
      closeButton.style.cursor = "pointer"
      closeButton.style.fontWeight = "bold"
      
      closeButton.onclick = () => {
        clearInterval(scanInterval)
        stream.getTracks().forEach(track => track.stop())
        if (document.body.contains(video)) document.body.removeChild(video)
        if (document.body.contains(closeButton)) document.body.removeChild(closeButton)
      }
      
      document.body.appendChild(closeButton)
    } catch (error) {
      setMessage("Failed to access camera. Please ensure camera permissions are granted.")
      setMessageType("error")
    }
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-md border-0">
          <div className="bg-slate-800 text-white px-6 py-5">
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <p className="text-slate-300 text-sm mt-1">Scan QR or enter code</p>
          </div>

        <div className="p-6 space-y-4">
          {messageType && (
            <div
              className={`flex gap-3 rounded-lg p-3 text-sm ${
                messageType === "success"
                  ? "bg-green-50 border border-green-200 text-green-900"
                  : messageType === "warning"
                    ? "bg-yellow-50 border border-yellow-200 text-yellow-900"
                    : "bg-red-50 border border-red-200 text-red-900"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              )}
              <p>{message}</p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Time</p>
              <p className="text-3xl font-mono font-bold text-slate-800">
                {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
              <div className="pt-3 border-t border-slate-200">
                <span className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getStatusBgColor(statusDisplay?.color || "blue")}`}>
                  {statusDisplay?.label || "Loading..."}
                </span>
              </div>
            </div>
          </div>

          {attendanceType === "checkout" && todayCheckInTime && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total Hours</span>
                <span
                  className={`text-base font-bold px-3 py-1 rounded ${
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

          <form onSubmit={handleSubmitAttendance} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAttendanceType("checkin")}
                disabled={loading}
                className={`flex-1 py-2 px-2 rounded font-medium text-sm transition-all ${
                  attendanceType === "checkin"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Clock className="h-4 w-4 inline mr-1" />
                Check In
              </button>
              <button
                type="button"
                onClick={() => setAttendanceType("checkout")}
                disabled={loading}
                className={`flex-1 py-2 px-2 rounded font-medium text-sm transition-all ${
                  attendanceType === "checkout"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Check Out
              </button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="employeeCode" className="text-xs font-semibold text-slate-700">Employee Code</Label>
              <Input
                id="employeeCode"
                placeholder="CW/XXX-DDMM"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.trim().toUpperCase().replace(/\s+/g, ''))}
                disabled={loading}
                className="text-center text-lg tracking-widest font-mono font-bold border-slate-300"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-2 text-base font-semibold bg-slate-800 hover:bg-slate-900 text-white" 
              disabled={loading} 
            >
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
                      Check In
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Check Out
                    </>
                  )}
                </>
              )}
            </Button>

            <Button
              type="button"
              className="w-full py-2 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleScanAnother}
              disabled={loading}
            >
              <Zap className="mr-2 h-4 w-4" />
              Scan Another QR
            </Button>

            {employeeCode && (
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm text-slate-700 border-slate-300"
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
