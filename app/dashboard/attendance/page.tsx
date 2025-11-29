"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, Clock, LogOut, AlertCircle } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"

interface AttendanceLog {
  id: string
  employeeName: string
  checkInFormatted: string
  checkOutFormatted: string | null
  status: string
}

export default function AttendancePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchAttendance = async () => {
    setDataLoading(true)
    try {
      const response = await apiClient.get<any>(
        `/api/attendance/all-logs?month=${month}&year=${year}`
      )
      setAttendanceLogs(response.attendanceLogs || [])
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      setAttendanceLogs([])
    } finally {
      setDataLoading(false)
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
    }
  }, [user, loading, month, year])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Attendance
            </h1>
            <p className="text-muted-foreground mt-2">Track employee attendance</p>
          </div>
          <Button onClick={() => router.push("/dashboard/attendance/qr-display")} className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <QrCode className="h-4 w-4" />
            View QR Code
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {attendanceLogs.length === 0 && !dataLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No attendance records found for this period</p>
            </div>
          )}

          {attendanceLogs.length > 0 && (
            <DataTable searchPlaceholder="Search attendance...">
              <DataTableHead>
                <DataTableHeader>Name</DataTableHeader>
                <DataTableHeader>Check In</DataTableHeader>
                <DataTableHeader>Check Out</DataTableHeader>
                <DataTableHeader>Status</DataTableHeader>
              </DataTableHead>
              <DataTableBody>
                {attendanceLogs.map((log) => (
                  <DataTableRow key={log.id}>
                    <DataTableCell>
                      <div className="font-medium">{log.employeeName}</div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{log.checkInFormatted}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <span>{log.checkOutFormatted || "Not checked out"}</span>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge 
                        status={log.status} 
                        variant={log.status === "CHECKED OUT" ? "success" : log.status === "CHECKED IN" ? "info" : "warning"}
                      />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
