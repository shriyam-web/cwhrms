"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, Clock, LogOut, AlertCircle, CheckCircle, Zap, Frown, MessageSquare, X, LogOutIcon, MapPin, User, Edit, RefreshCw, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"

interface AttendanceLog {
  id: string
  employeeName: string
  employeeCode: string
  checkInFormatted: string
  checkOutFormatted: string | null
  status: string
  arrivalStatus: string
  departureStatus: string
  checkInTime?: string
  checkOutTime?: string | null
  notes?: string
  isEligibleForHalfDay?: boolean
  isHalfDay?: boolean
  markedByHR?: boolean
  latitude?: number
  longitude?: number
  markedByHRAt?: string | null
  editedByHRId?: string
  editedByHRName?: string
  editedByHRAt?: string | null
}



const calculateTotalHours = (checkIn?: string, checkOut?: string | null, currentTime?: Date): { formatted: string; hours: number } => {
  if (!checkIn) return { formatted: "-", hours: 0 }

  try {
    const checkInDate = new Date(checkIn)
    const checkOutDate = checkOut ? new Date(checkOut) : (currentTime || new Date())
    const diffMs = checkOutDate.getTime() - checkInDate.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 0) return { formatted: "-", hours: 0 }

    const hours = Math.floor(diffHours)
    const remainingMs = diffMs - (hours * 60 * 60 * 1000)
    const minutes = Math.floor(remainingMs / (60 * 1000))
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000)

    return { formatted: `${hours}h ${minutes}m ${seconds}s`, hours: diffHours }
  } catch {
    return { formatted: "-", hours: 0 }
  }
}

const getISTDateTime = (): { iso: string; formatted: string } => {
  const now = new Date()
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const formatted = istTime.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
  return {
    iso: istTime.toISOString().slice(0, 16),
    formatted
  }
}

const formatTimeInIST = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    const formatted = date.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    })
    return `${formatted} (IST)`
  } catch {
    return timeString
  }
}

const convertToISTISO = (datetimeLocalValue: string): string => {
  const [date, time] = datetimeLocalValue.split("T")
  const istDate = new Date(`${date}T${time}:00+05:30`)
  return istDate.toISOString()
}

const getISTDatetimeLocal = (): string => {
  const now = new Date()
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const year = istTime.getFullYear()
  const month = String(istTime.getMonth() + 1).padStart(2, "0")
  const date = String(istTime.getDate()).padStart(2, "0")
  const hours = String(istTime.getHours()).padStart(2, "0")
  const minutes = String(istTime.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${date}T${hours}:${minutes}`
}

const convertUTCToISTDatetimeLocal = (utcDate: Date | string): string => {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate
  const istTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const year = istTime.getFullYear()
  const month = String(istTime.getMonth() + 1).padStart(2, "0")
  const dateStr = String(istTime.getDate()).padStart(2, "0")
  const hours = String(istTime.getHours()).padStart(2, "0")
  const minutes = String(istTime.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${dateStr}T${hours}:${minutes}`
}

export default function AttendancePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [notesModal, setNotesModal] = useState<{ id: string; notes: string } | null>(null)
  const [notesLoading, setNotesLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [forcedCheckoutModal, setForcedCheckoutModal] = useState<{ id: string; employeeName: string; checkoutTime: string } | null>(null)
  const [forcedCheckoutLoading, setForcedCheckoutLoading] = useState(false)
  const [manualMarkModal, setManualMarkModal] = useState<{ isOpen: boolean; employeeCode: string; employeeName: string; checkInTime: string; checkOutTime: string } | null>(null)
  const [manualMarkLoading, setManualMarkLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [holidays, setHolidays] = useState<number[]>([])
  const [showHolidayManager, setShowHolidayManager] = useState(false)
  const [holidayLoading, setHolidayLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [employeeDetailModal, setEmployeeDetailModal] = useState<{ employeeCode: string; employeeName: string } | null>(null)
  const [editAttendanceModal, setEditAttendanceModal] = useState<{ id: string; employeeName: string; checkInTime: string; checkOutTime: string } | null>(null)
  const [editAttendanceLoading, setEditAttendanceLoading] = useState(false)
  const [halfDayModal, setHalfDayModal] = useState<{ id: string; employeeName: string; reason: string } | null>(null)
  const [halfDayModalLoading, setHalfDayModalLoading] = useState(false)

  const fetchAttendance = async () => {
    setDataLoading(true)
    try {
      const response = await apiClient.get<AttendanceLog[]>(
        `/api/attendance/all-logs?month=${month}&year=${year}`
      )
      setAttendanceLogs((response as any).attendanceLogs || response.data || [])
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      setAttendanceLogs([])
    } finally {
      setDataLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get("/api/employees")
      setEmployees((response as any).employees || response.data || [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const fetchHolidays = async () => {
    try {
      const response = await apiClient.get(
        `/api/attendance/holidays?month=${month}&year=${year}`
      )
      const data = (response as any).holidays
      setHolidays(data?.leaveeDays || [])
    } catch (error) {
      console.error("Failed to fetch holidays:", error)
    }
  }

  const saveHolidays = async () => {
    setHolidayLoading(true)
    try {
      await apiClient.post("/api/attendance/holidays", {
        month,
        year,
        leaveeDays: holidays,
      })
      setShowHolidayManager(false)
    } catch (error) {
      console.error("Failed to save holidays:", error)
    } finally {
      setHolidayLoading(false)
    }
  }

  const handleManualMarkAttendance = async () => {
    if (!manualMarkModal) return
    setManualMarkLoading(true)
    try {
      const selectedEmployee = employees.find(emp => emp.employeeCode === manualMarkModal.employeeCode)
      if (!selectedEmployee) {
        throw new Error("Employee not found")
      }

      await apiClient.post("/api/attendance/manual-mark", {
        employeeId: selectedEmployee.id,
        checkInTime: manualMarkModal.checkInTime,
        checkOutTime: manualMarkModal.checkOutTime || null,
      })

      setManualMarkModal(null)
      fetchAttendance()
    } catch (error) {
      console.error("Failed to mark attendance:", error)
    } finally {
      setManualMarkLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!notesModal) return
    setNotesLoading(true)
    try {
      await apiClient.post("/api/attendance/update-notes", {
        attendanceId: notesModal.id,
        notes: notesModal.notes,
      })
      setAttendanceLogs(prev =>
        prev.map(log =>
          log.id === notesModal.id ? { ...log, notes: notesModal.notes } : log
        )
      )
      setNotesModal(null)
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleMarkHalfDay = async () => {
    if (!halfDayModal) return
    setHalfDayModalLoading(true)
    try {
      await apiClient.post("/api/attendance/mark-half-day", {
        attendanceId: halfDayModal.id,
        reason: halfDayModal.reason,
      })
      setAttendanceLogs(prev =>
        prev.map(log =>
          log.id === halfDayModal.id
            ? { ...log, isHalfDay: true, isEligibleForHalfDay: false }
            : log
        )
      )
      setHalfDayModal(null)
    } catch (error) {
      console.error("Failed to mark half-day:", error)
    } finally {
      setHalfDayModalLoading(false)
    }
  }

  const handleForcedCheckout = async () => {
    if (!forcedCheckoutModal) return
    setForcedCheckoutLoading(true)
    try {
      const isoCheckoutTime = convertToISTISO(forcedCheckoutModal.checkoutTime)
      await apiClient.post("/api/attendance/forced-checkout", {
        attendanceId: forcedCheckoutModal.id,
        checkoutTime: isoCheckoutTime,
      })
      setAttendanceLogs(prev =>
        prev.map(log =>
          log.id === forcedCheckoutModal.id
            ? { ...log, status: "CHECKED OUT", checkOutFormatted: formatTimeInIST(isoCheckoutTime), checkOutTime: isoCheckoutTime }
            : log
        )
      )
      setForcedCheckoutModal(null)
    } catch (error) {
      console.error("Failed to mark forced checkout:", error)
    } finally {
      setForcedCheckoutLoading(false)
    }
  }

  const handleEditAttendance = async () => {
    if (!editAttendanceModal) return
    setEditAttendanceLoading(true)
    try {
      const checkInISO = convertToISTISO(editAttendanceModal.checkInTime)
      const checkOutISO = editAttendanceModal.checkOutTime ? convertToISTISO(editAttendanceModal.checkOutTime) : null
      
      await apiClient.post("/api/attendance/edit-attendance", {
        attendanceId: editAttendanceModal.id,
        checkInTime: checkInISO,
        checkOutTime: checkOutISO,
      })
      
      fetchAttendance()
      setEditAttendanceModal(null)
    } catch (error) {
      console.error("Failed to edit attendance:", error)
    } finally {
      setEditAttendanceLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && user && user.role !== "HR") {
      router.push("/dashboard/my-attendance")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "HR" && !loading) {
      fetchAttendance()
      fetchEmployees()
      fetchHolidays()
    }
  }, [user, loading, month, year])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (attendanceLogs.length > 0 && !selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      const uniqueDates = getUniqueDates()
      if (uniqueDates.includes(today)) {
        setSelectedDate(today)
      } else if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0])
      }
    }
  }, [attendanceLogs])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  const getFilteredLogs = () => {
    let filtered = attendanceLogs
    if (selectedEmployee) {
      filtered = filtered.filter(log => log.employeeCode === selectedEmployee)
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter)
    }
    return filtered
  }

  const formatHoursToHM = (decimalHours: number) => {
    const hours = Math.floor(decimalHours)
    const minutes = Math.round((decimalHours - hours) * 60)
    return `${hours}h ${minutes}m`
  }

  const getUniqueDates = () => {
    const dates = new Set<string>()
    attendanceLogs.forEach(log => {
      if (log.checkInTime) {
        const date = new Date(log.checkInTime)
        const dateStr = date.toISOString().split('T')[0]
        dates.add(dateStr)
      }
    })
    return Array.from(dates).sort().reverse()
  }

  const getLogsForDate = (dateStr: string) => {
    return attendanceLogs.filter(log => {
      if (!log.checkInTime) return false
      const logDate = new Date(log.checkInTime).toISOString().split('T')[0]
      return logDate === dateStr
    })
  }

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const todayStr = today.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (dateStr === todayStr) return 'Today'
    if (dateStr === yesterdayStr) return 'Yesterday'
    
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  const calculateStats = () => {
    const filtered = getFilteredLogs()
    const daysInMonth = new Date(year, month, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year
    const todayDate = today.getDate()

    let workingDaysInMonth = 0
    let workingDaysToDate = 0

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i)
      const day = date.getDay()
      const isHoliday = holidays.includes(i)
      if (day !== 0 && !isHoliday) {
        workingDaysInMonth++
        if (!isCurrentMonth || i <= todayDate) {
          workingDaysToDate++
        }
      }
    }

    const totalHours = filtered.reduce((sum, log) => {
      const hours = calculateTotalHours(log.checkInTime, log.checkOutTime, currentTime).hours
      return sum + hours
    }, 0)

    const daysWithRecords = filtered.length
    const leavesTaken = Math.max(0, workingDaysToDate - daysWithRecords)
    const dailyAverage = daysWithRecords > 0 ? totalHours / daysWithRecords : 0
    const expectedHoursToDate = workingDaysToDate * 8.5
    const expectedHoursForMonth = workingDaysInMonth * 8.5

    const criteriaAchieved = dailyAverage >= 8.5

    return {
      workingDaysInMonth,
      workingDaysToDate,
      totalHours,
      daysWithRecords,
      dailyAverage,
      leavesTaken,
      expectedHoursToDate,
      expectedHoursForMonth,
      criteriaAchieved
    }
  }

  const renderCalendar = (m: number, y: number) => {
    const firstDay = new Date(y, m - 1, 1).getDay()
    const daysInMonth = new Date(y, m, 0).getDate()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  const getCalendarMonths = () => {
    let prevMonth = month - 1
    let prevYear = year

    if (prevMonth === 0) {
      prevMonth = 12
      prevYear--
    }

    let nextMonth = month + 1
    let nextYear = year

    if (nextMonth === 13) {
      nextMonth = 1
      nextYear++
    }

    return [
      { month: prevMonth, year: prevYear },
      { month: month, year: year },
      { month: nextMonth, year: nextYear }
    ]
  }

  if (!user || user.role !== "HR") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-6 text-red-900">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Access Denied</h3>
              <p className="text-sm">Only HR users can access attendance management.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = calculateStats()
  const filteredLogs = getFilteredLogs()

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Attendance
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage and track employee attendance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAttendance} disabled={dataLoading} className="gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
              <RefreshCw className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setManualMarkModal({ isOpen: true, employeeCode: "", employeeName: "", checkInTime: getISTDatetimeLocal(), checkOutTime: "" })} className="gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium shadow-sm">
              <CheckCircle className="h-4 w-4" />
              Mark Attendance
            </Button>
            <Button onClick={() => router.push("/dashboard/attendance/qr-display")} className="gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>
        </div>

        {selectedEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">Working Days</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.workingDaysToDate}</p>
              <p className="text-xs text-slate-500 mt-1">of {stats.workingDaysInMonth} total</p>
            </Card>
            <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">Days Worked</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.daysWithRecords}</p>
              <p className="text-xs text-slate-500 mt-1">attendance recorded</p>
            </Card>
            <Card className="p-4 border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold mb-2">Leaves Taken</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.leavesTaken}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">so far</p>
            </Card>
            <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">Daily Average</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatHoursToHM(stats.dailyAverage)}</p>
              <p className="text-xs text-slate-500 mt-1">per day worked</p>
            </Card>
            <Card className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2">Total Hours</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatHoursToHM(stats.totalHours)}</p>
              <p className="text-xs text-slate-500 mt-1">worked</p>
            </Card>
            <Card className={`p-4 border ${stats.criteriaAchieved ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950" : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950"}`}>
              <p className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">Criteria</p>
              <p className={`text-2xl font-bold ${stats.criteriaAchieved ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {stats.criteriaAchieved ? "Met" : "Not Met"}
              </p>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-400">8.5h/day avg</p>
            </Card>
          </div>
        )}

        {dataLoading && (
          <Card className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-slate-600 dark:text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading attendance data...</p>
          </Card>
        )}

        {!dataLoading && (
        <Card className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filters</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowHolidayManager(true)}
                className="text-xs h-auto py-1 px-3 bg-blue-100 border border-blue-300 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50 font-medium transition-all"
              >
                🏖️ Holidays
              </Button>
              <Button
                onClick={() => setShowCalendar(true)}
                className="text-xs h-auto py-1 px-3 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium transition-all"
              >
                📅 Calendar
              </Button>
              <Button
                onClick={() => {
                  setMonth(new Date().getMonth() + 1)
                  setYear(new Date().getFullYear())
                  setSelectedEmployee("")
                  setStatusFilter("all")
                }}
                className="text-xs h-auto py-1 px-3 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium transition-all"
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employeeCode}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all"
              >
                <option value="all">All Status</option>
                <option value="CHECKED IN">Check in</option>
                <option value="CHECKED OUT">Check out</option>
                <option value="HALF_DAY">Half day</option>
              </select>
            </div>
          </div>
        </Card>
        )}

        {attendanceLogs.length === 0 && !dataLoading && (
          <Card className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No attendance records found</p>
          </Card>
        )}

        {attendanceLogs.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Date</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {getUniqueDates().map(dateStr => (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDate === dateStr
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {formatDateForDisplay(dateStr)}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {selectedDate ? (
                (() => {
                  const dateLogsFiltered = getLogsForDate(selectedDate).filter(log => {
                    let pass = true
                    if (selectedEmployee) pass = pass && log.employeeCode === selectedEmployee
                    if (statusFilter !== "all") pass = pass && log.status === statusFilter
                    return pass
                  })
                  return dateLogsFiltered.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Employee</th>
                            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">In</th>
                            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Out</th>
                            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Hours</th>
                            <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {dateLogsFiltered.map(log => {
                            const hours = calculateTotalHours(log.checkInTime, log.checkOutTime, currentTime)
                            const meetsMinimum = hours.hours >= 8.5
                            return (
                              <tr key={log.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors ${log.markedByHR ? "bg-blue-50/30 dark:bg-blue-950/15" : ""}`}>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      onClick={() => setEmployeeDetailModal({ employeeCode: log.employeeCode, employeeName: log.employeeName })}
                                      className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                                    >
                                      {log.employeeName}
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-slate-500 dark:text-slate-400">{log.employeeCode}</span>
                                      {log.isHalfDay && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30">
                                          <Clock className="h-2.5 w-2.5" />
                                          Half Day
                                        </span>
                                      )}
                                      {log.markedByHR && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                                          HR Marked
                                        </span>
                                      )}
                                      {log.editedByHRAt && (
                                        <span title={`Edited by ${log.editedByHRName} at ${formatTimeInIST(log.editedByHRAt)}`} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800/30">
                                          <Edit className="h-2.5 w-2.5" />
                                          Edited by HR
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${log.arrivalStatus === "APPRECIATED" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                    log.arrivalStatus === "ON TIME" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                      log.arrivalStatus === "GRACE" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" :
                                        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}>
                                    {log.checkInFormatted}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${log.departureStatus === "EARLY" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                                    log.departureStatus === "GRACE" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" :
                                      log.departureStatus === "ON TIME" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                        log.departureStatus === "APPRECIATED" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    }`}>
                                    {log.checkOutFormatted || "Pending"}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${meetsMinimum
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}>
                                    {hours.formatted}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <StatusBadge
                                    status={log.status}
                                    variant={log.status === "CHECKED OUT" ? "success" : log.status === "CHECKED IN" ? "info" : "warning"}
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex justify-end gap-1">
                                    {log.isEligibleForHalfDay && (
                                      <Button
                                        size="sm"
                                        onClick={() => setHalfDayModal({ id: log.id, employeeName: log.employeeName, reason: "" })}
                                        disabled={halfDayModalLoading}
                                        className="h-auto py-1.5 px-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-medium transition-all text-xs"
                                        title="Mark as half day (HR action)"
                                      >
                                        Half Day
                                      </Button>
                                    )}
                                    {log.latitude && log.longitude && !log.markedByHR && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          const mapsUrl = `https://www.google.com/maps?q=${log.latitude},${log.longitude}`
                                          window.open(mapsUrl, '_blank')
                                        }}
                                        className="h-auto py-1.5 px-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-medium transition-all"
                                        title="View location"
                                      >
                                        <MapPin className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={() => setNotesModal({ id: log.id, notes: log.notes || "" })}
                                      className={`h-auto py-1.5 px-2 font-medium transition-all ${
                                        log.notes
                                          ? "bg-slate-900 hover:bg-slate-800 dark:bg-white text-white dark:text-slate-900 dark:hover:bg-slate-100"
                                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                                      }`}
                                      title={log.notes ? "Edit notes" : "Add notes"}
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                    {log.status === "CHECKED IN" && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          const checkoutTime = getISTDatetimeLocal()
                                          setForcedCheckoutModal({ id: log.id, employeeName: log.employeeName, checkoutTime })
                                        }}
                                        className="h-auto py-1.5 px-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-medium transition-all"
                                        title="Checkout"
                                      >
                                        <LogOut className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const checkInLocal = log.checkInTime ? convertUTCToISTDatetimeLocal(log.checkInTime) : getISTDatetimeLocal()
                                        const checkOutLocal = log.checkOutTime ? convertUTCToISTDatetimeLocal(log.checkOutTime) : ""
                                        setEditAttendanceModal({ id: log.id, employeeName: log.employeeName, checkInTime: checkInLocal, checkOutTime: checkOutLocal })
                                      }}
                                      className="h-auto py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-medium transition-all"
                                      title="Edit attendance times"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Card className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-slate-600 dark:text-slate-400">No records found for this date</p>
                    </Card>
                  )
                })()
              ) : (
                <Card className="p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-slate-600 dark:text-slate-400">Select a date to view attendance</p>
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Accordion type="single" collapsible>
            <AccordionItem value="color-legend" className="border-0">
              <AccordionTrigger className="group px-0 py-0 hover:no-underline">
                <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white px-8 py-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Attendance Status Guide</h3>
                      <p className="text-sm text-slate-300 mt-1">Understand the color-coded attendance system</p>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="mt-6 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="space-y-10">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-purple-600 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">Check-In Status</h3>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full ml-auto">Target: 10:00 AM IST</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <Zap className="h-5 w-5" />
                            <span className="font-bold text-sm">Before 10:00 AM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">🌟 Appreciated</p>
                          <p className="text-sm text-purple-100">Early arrival shows dedication and commitment</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-bold text-sm">At 10:00 AM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">✓ Perfect</p>
                          <p className="text-sm text-green-100">Exactly on time, perfect punctuality</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-bold text-sm">10:01 - 10:15 AM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">⏰ Grace Period</p>
                          <p className="text-sm text-amber-100">Within acceptable grace window</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <Frown className="h-5 w-5" />
                            <span className="font-bold text-sm">After 10:15 AM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">⚠️ Late</p>
                          <p className="text-sm text-red-100">Beyond grace period - consider adding note</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-blue-600 rounded-lg">
                        <LogOut className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900">Check-Out Status</h3>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full ml-auto">6:15 PM → 7:00 PM+ IST</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <Frown className="h-5 w-5" />
                            <span className="font-bold text-sm">Before 6:15 PM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">⚠️ Early</p>
                          <p className="text-sm text-red-100">Incomplete work hours</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-bold text-sm">6:15 - 6:25 PM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">⏰ Grace</p>
                          <p className="text-sm text-amber-100">Acceptable checkout window</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-bold text-sm">6:25 PM - 7:00 PM</span>
                          </div>
                          <p className="font-bold text-lg mb-1">✓ Standard</p>
                          <p className="text-sm text-green-100">Full work hours completed</p>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full -mr-16 -mt-16 opacity-20"></div>
                        <div className="relative">
                          <div className="inline-flex items-center gap-2 mb-3">
                            <Zap className="h-5 w-5" />
                            <span className="font-bold text-sm">After 7:00 PM 🎉</span>
                          </div>
                          <p className="font-bold text-lg mb-1">⭐ Extra Effort</p>
                          <p className="text-sm text-purple-100">Beyond standard hours - outstanding!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {showHolidayManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Manage Holidays for {new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={() => setShowHolidayManager(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select additional leave/holiday dates (apart from Sundays):
              </p>
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center py-2">
                    {day}
                  </div>
                ))}
                {renderCalendar(month, year).map((day, idx) => {
                  const isSunday = day !== null && new Date(year, month - 1, day).getDay() === 0
                  const isSelected = holidays.includes(day || 0)

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (day === null || isSunday) return
                        if (isSelected) {
                          setHolidays(holidays.filter(d => d !== day))
                        } else {
                          setHolidays([...holidays, day])
                        }
                      }}
                      disabled={day === null || isSunday}
                      className={`py-2 text-sm rounded font-medium transition-colors ${day === null
                        ? ""
                        : isSunday
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-not-allowed opacity-50"
                          : isSelected
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong>Selected holidays:</strong> {holidays.length > 0 ? holidays.sort((a, b) => a - b).join(", ") : "None"}
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  onClick={() => setShowHolidayManager(false)}
                  disabled={holidayLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveHolidays}
                  disabled={holidayLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium"
                >
                  {holidayLoading ? "Saving..." : "Save Holidays"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getCalendarMonths().map((cal) => (
                <div key={`${cal.year}-${cal.month}`} className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                    {new Date(cal.year, cal.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                  </h3>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">
                        {day.charAt(0)}
                      </div>
                    ))}
                    {renderCalendar(cal.month, cal.year).map((day, idx) => (
                      <div
                        key={idx}
                        className={`py-1.5 text-xs rounded font-medium transition-colors ${day === null
                          ? ""
                          : day === new Date().getDate() && cal.month === new Date().getMonth() + 1 && cal.year === new Date().getFullYear()
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-6">
              <Button
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {notesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <MessageSquare className="h-4 w-4" />
                Notes
              </h2>
              <button
                onClick={() => setNotesModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Note (max 500 characters)
                </label>
                <Textarea
                  placeholder="Enter reason for late attendance, special circumstances, etc..."
                  value={notesModal.notes}
                  onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value.slice(0, 500) })}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{notesModal.notes.length}/500</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setNotesModal(null)}
                  disabled={notesLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNotes}
                  disabled={notesLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium"
                >
                  {notesLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}


      {forcedCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <LogOutIcon className="h-4 w-4" />
                Check-out
              </h2>
              <button
                onClick={() => setForcedCheckoutModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  Are you sure you want to mark <span className="font-semibold">{forcedCheckoutModal.employeeName}</span> as checked out?
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Checkout Time (IST)
                    </label>
                    <Input
                      type="datetime-local"
                      value={forcedCheckoutModal.checkoutTime}
                      onChange={(e) => setForcedCheckoutModal({ ...forcedCheckoutModal, checkoutTime: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Formatted Time:</span> {formatTimeInIST(convertToISTISO(forcedCheckoutModal.checkoutTime))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setForcedCheckoutModal(null)}
                  disabled={forcedCheckoutLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForcedCheckout}
                  disabled={forcedCheckoutLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium transition-all"
                >
                  {forcedCheckoutLoading ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {manualMarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <CheckCircle className="h-4 w-4" />
                Mark Attendance
              </h2>
              <button
                onClick={() => setManualMarkModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Select Employee *
                </label>
                {employees.length === 0 ? (
                  <div className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400">
                    Loading employees...
                  </div>
                ) : (
                  <select
                    value={manualMarkModal.employeeCode}
                    onChange={(e) => {
                      const selected = employees.find(emp => emp.employeeCode === e.target.value)
                      if (selected) {
                        setManualMarkModal({
                          ...manualMarkModal,
                          employeeCode: selected.employeeCode,
                          employeeName: selected.name
                        })
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employeeCode}>
                        {emp.name} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Check-in Time (IST) *
                  </label>
                  <Input
                    type="datetime-local"
                    value={manualMarkModal.checkInTime}
                    onChange={(e) => setManualMarkModal({ ...manualMarkModal, checkInTime: e.target.value })}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Standard: 10:00 AM</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Check-out Time (IST) - Optional
                  </label>
                  <Input
                    type="datetime-local"
                    value={manualMarkModal.checkOutTime}
                    onChange={(e) => setManualMarkModal({ ...manualMarkModal, checkOutTime: e.target.value })}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Standard: 6:25 PM - 7:00 PM</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-3">📋 Time Guidelines</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-blue-100 dark:border-blue-800">
                    <p className="font-medium text-blue-700 dark:text-blue-400">🌟 Before 10 AM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Appreciated</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-green-100 dark:border-green-800">
                    <p className="font-medium text-green-700 dark:text-green-400">✓ 10:00 AM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Perfect</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-amber-100 dark:border-amber-800">
                    <p className="font-medium text-amber-700 dark:text-amber-400">⏰ 10:01-10:15</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Grace</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-red-100 dark:border-red-800">
                    <p className="font-medium text-red-700 dark:text-red-400">⚠️ After 10:15</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Late</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-3">🎯 Checkout Guidelines</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-red-100 dark:border-red-800">
                    <p className="font-medium text-red-700 dark:text-red-400">⚠️ Before 6:15 PM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Incomplete Hours</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-amber-100 dark:border-amber-800">
                    <p className="font-medium text-amber-700 dark:text-amber-400">⏰ 6:15-6:25 PM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Grace Period</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-green-100 dark:border-green-800">
                    <p className="font-medium text-green-700 dark:text-green-400">✓ 6:25-7:00 PM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Standard Hours</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-2.5 rounded border border-purple-100 dark:border-purple-800">
                    <p className="font-medium text-purple-700 dark:text-purple-400">⭐ After 7:00 PM</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Extra Effort!</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Marked as manually entered by HR with a special badge and timestamp for audit trail
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  onClick={() => setManualMarkModal(null)}
                  disabled={manualMarkLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleManualMarkAttendance}
                  disabled={manualMarkLoading || !manualMarkModal.employeeCode || !manualMarkModal.checkInTime}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium transition-all"
                >
                  {manualMarkLoading ? "Marking..." : "Mark Attendance"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {employeeDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="h-4 w-4" />
                {employeeDetailModal.employeeName} ({employeeDetailModal.employeeCode})
              </h2>
              <button
                onClick={() => setEmployeeDetailModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {attendanceLogs.filter(log => log.employeeCode === employeeDetailModal.employeeCode).length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">No attendance records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Check In</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Check Out</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Total Hours</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceLogs.filter(log => log.employeeCode === employeeDetailModal.employeeCode).map((log) => {
                        const hours = calculateTotalHours(log.checkInTime, log.checkOutTime, currentTime)
                        return (
                          <tr key={log.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {log.checkInTime ? new Date(log.checkInTime).toLocaleDateString('en-IN') : '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {log.checkInFormatted}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {log.checkOutFormatted || '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {hours.formatted}
                            </td>
                            <td className="py-2 px-3">
                              <StatusBadge
                                status={log.status}
                                variant={log.status === "CHECKED OUT" ? "success" : log.status === "CHECKED IN" ? "info" : "warning"}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                onClick={() => setEmployeeDetailModal(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {editAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Edit className="h-4 w-4" />
                Edit Attendance
              </h2>
              <button
                onClick={() => setEditAttendanceModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{editAttendanceModal.employeeName}</span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Current Attendance (IST)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Check-in:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {editAttendanceModal.checkInTime 
                        ? (() => {
                            const [date, time] = editAttendanceModal.checkInTime.split('T')
                            const [year, month, day] = date.split('-')
                            const [hours, minutes] = time.split(':')
                            return `${day}/${month}/${year} ${hours}:${minutes}`
                          })()
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Check-out:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {editAttendanceModal.checkOutTime 
                        ? (() => {
                            const [date, time] = editAttendanceModal.checkOutTime.split('T')
                            const [year, month, day] = date.split('-')
                            const [hours, minutes] = time.split(':')
                            return `${day}/${month}/${year} ${hours}:${minutes}`
                          })()
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Update Times</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Check-in Time (IST) *
                    </label>
                    <Input
                      type="datetime-local"
                      value={editAttendanceModal.checkInTime}
                      onChange={(e) => setEditAttendanceModal({ ...editAttendanceModal, checkInTime: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Check-out Time (IST) - Optional
                    </label>
                    <Input
                      type="datetime-local"
                      value={editAttendanceModal.checkOutTime}
                      onChange={(e) => setEditAttendanceModal({ ...editAttendanceModal, checkOutTime: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300">
                  This action will be marked with an "Edited by HR" badge with timestamp for audit trail.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setEditAttendanceModal(null)}
                  disabled={editAttendanceLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditAttendance}
                  disabled={editAttendanceLoading || !editAttendanceModal.checkInTime}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium transition-all"
                >
                  {editAttendanceLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {halfDayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-5 shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="h-4 w-4" />
                Mark Half Day
              </h2>
              <button
                onClick={() => setHalfDayModal(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{halfDayModal.employeeName}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  HR Action: Only HR can mark an employee as half day due to unforeseen circumstances.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Reason for Half Day *
                </label>
                <Textarea
                  placeholder="Enter reason (e.g., Personal emergency, Medical appointment, Client meeting, etc.)"
                  value={halfDayModal.reason}
                  onChange={(e) => setHalfDayModal({ ...halfDayModal, reason: e.target.value.slice(0, 500) })}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{halfDayModal.reason.length}/500</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ This will mark the employee's attendance as half day for the day. This action is logged for audit purposes.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setHalfDayModal(null)}
                  disabled={halfDayModalLoading}
                  className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkHalfDay}
                  disabled={halfDayModalLoading || !halfDayModal.reason.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-medium transition-all"
                >
                  {halfDayModalLoading ? "Marking..." : "Confirm Half Day"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
