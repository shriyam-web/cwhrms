"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"
import { Clock, LogOut, MapPin, AlertCircle, CheckCircle, Zap, Frown } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"

interface AttendanceLog {
  id: string
  checkInTime: string
  checkOutTime: string | null
  status: string
  arrivalStatus: string
  departureStatus: string
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
                          log.arrivalStatus === "APPRECIATED" ? "text-purple-600" : 
                          log.arrivalStatus === "ON TIME" ? "text-green-600" :
                          log.arrivalStatus === "GRACE" ? "text-yellow-600" :
                          "text-red-600"
                        }`} />
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          log.arrivalStatus === "APPRECIATED" ? "bg-purple-100 text-purple-800" : 
                          log.arrivalStatus === "ON TIME" ? "bg-green-100 text-green-800" :
                          log.arrivalStatus === "GRACE" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {log.checkInFormatted}
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex items-center gap-2">
                        {log.checkOutFormatted && log.departureStatus !== "NOT CHECKED OUT" ? (
                          <>
                            <LogOut className={`h-4 w-4 ${
                              log.departureStatus === "EARLY" ? "text-red-600" :
                              log.departureStatus === "GRACE" ? "text-yellow-600" :
                              log.departureStatus === "ON TIME" ? "text-green-600" :
                              log.departureStatus === "APPRECIATED" ? "text-purple-600" :
                              "text-slate-600"
                            }`} />
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              log.departureStatus === "EARLY" ? "bg-red-100 text-red-800" :
                              log.departureStatus === "GRACE" ? "bg-yellow-100 text-yellow-800" :
                              log.departureStatus === "ON TIME" ? "bg-green-100 text-green-800" :
                              log.departureStatus === "APPRECIATED" ? "bg-purple-100 text-purple-800" :
                              ""
                            }`}>
                              {log.checkOutFormatted}
                            </span>
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

          <div className="mt-12 pt-8">
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
        </Card>
      </div>
    </DashboardLayout>
  )
}
