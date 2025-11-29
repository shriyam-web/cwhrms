"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"
import { Clock, LogOut, MapPin, AlertCircle } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"

interface AttendanceLog {
  id: string
  checkInTime: string
  checkOutTime: string | null
  status: string
  arrivalStatus: string
  latitude: number | null
  longitude: number | null
  deviceId: string | null
  checkInFormatted: string
  checkOutFormatted: string | null
}

export default function MyAttendancePage() {
  const { user, loading } = useAuth()
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchAttendance = async () => {
    setDataLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<any>(
        `/api/attendance/my-logs?month=${month}&year=${year}`
      )
      setAttendanceLogs(response.attendanceLogs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance")
      setAttendanceLogs([])
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (user && !loading) {
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-6 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">Please log in to view your attendance</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            My Attendance
          </h1>
          <p className="text-muted-foreground mt-2">View your check-in and check-out records</p>
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
            <div className="flex items-end">
              <Button onClick={fetchAttendance} disabled={dataLoading}>
                {dataLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-4 text-red-900 mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {attendanceLogs.length === 0 && !dataLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No attendance records found for this period</p>
            </div>
          )}

          {attendanceLogs.length > 0 && (
            <DataTable searchPlaceholder="Search attendance...">
              <DataTableHead>
                <DataTableHeader>Check In</DataTableHeader>
                <DataTableHeader>Check Out</DataTableHeader>
                <DataTableHeader>Status</DataTableHeader>
                <DataTableHeader>Location</DataTableHeader>
              </DataTableHead>
              <DataTableBody>
                {attendanceLogs.map((log) => (
                  <DataTableRow key={log.id}>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${
                          log.arrivalStatus === "EARLY" ? "text-blue-600" : 
                          log.arrivalStatus === "ON TIME" ? "text-green-600" : 
                          "text-red-600"
                        }`} />
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          log.arrivalStatus === "EARLY" ? "bg-blue-100 text-blue-800" : 
                          log.arrivalStatus === "ON TIME" ? "bg-green-100 text-green-800" : 
                          "bg-red-100 text-red-800"
                        }`}>
                          {log.checkInFormatted}
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        {log.checkOutFormatted ? (
                          <>
                            <LogOut className="h-4 w-4 text-slate-600" />
                            <p>{log.checkOutFormatted}</p>
                          </>
                        ) : (
                          <p className="text-amber-600">Not checked out</p>
                        )}
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        log.status === "CHECKED OUT"
                          ? "bg-green-100 text-green-800"
                          : log.status === "CHECKED IN"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {log.status}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      {log.latitude && log.longitude ? (
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          <a
                            href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No location</span>
                      )}
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
