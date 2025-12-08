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
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
              📋
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-slate-200 dark:to-slate-50 bg-clip-text text-transparent line-clamp-2">
                My Attendance
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">View your complete check-in and check-out records with detailed analytics</p>
            </div>
          </div>
        </div>

        <Card className="p-4 sm:p-6 md:p-8 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full mt-2 px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground block">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full mt-2 px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchAttendance} 
                disabled={dataLoading}
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 md:px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all"
              >
                {dataLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 p-5 text-red-800 dark:text-red-300 mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {attendanceLogs.length === 0 && !dataLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold">No attendance records found</p>
              <p className="text-sm mt-1">Try selecting a different month or year</p>
            </div>
          )}

          {attendanceLogs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <DataTable searchPlaceholder="Search attendance...">
                <DataTableHead>
                  <DataTableHeader>Check In</DataTableHeader>
                  <DataTableHeader>Check Out</DataTableHeader>
                  <DataTableHeader>Status</DataTableHeader>
                  <DataTableHeader>Location</DataTableHeader>
                </DataTableHead>
                <DataTableBody>
                  {attendanceLogs.map((log) => (
                    <DataTableRow key={log.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <DataTableCell>
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 flex-shrink-0 ${
                            log.arrivalStatus === "APPRECIATED" ? "text-purple-600" : 
                            log.arrivalStatus === "ON TIME" ? "text-green-600" :
                            log.arrivalStatus === "GRACE" ? "text-yellow-600" :
                            "text-red-600"
                          }`} />
                          <div className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${
                            log.arrivalStatus === "APPRECIATED" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : 
                            log.arrivalStatus === "ON TIME" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                            log.arrivalStatus === "GRACE" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}>
                            {log.checkInFormatted}
                          </div>
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex items-center gap-2">
                          {log.checkOutFormatted && log.departureStatus !== "NOT CHECKED OUT" ? (
                            <>
                              <LogOut className={`h-4 w-4 flex-shrink-0 ${
                                log.departureStatus === "EARLY" ? "text-red-600" :
                                log.departureStatus === "GRACE" ? "text-yellow-600" :
                                log.departureStatus === "ON TIME" ? "text-green-600" :
                                log.departureStatus === "APPRECIATED" ? "text-purple-600" :
                                "text-slate-600"
                              }`} />
                              <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${
                                log.departureStatus === "EARLY" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                                log.departureStatus === "GRACE" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                log.departureStatus === "ON TIME" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                log.departureStatus === "APPRECIATED" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                ""
                              }`}>
                                {log.checkOutFormatted}
                              </span>
                            </>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Not checked out</span>
                          )}
                        </div>
                      </DataTableCell>
                      <DataTableCell>
                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          log.status === "CHECKED OUT"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : log.status === "CHECKED IN"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}>
                          {log.status}
                        </span>
                      </DataTableCell>
                      <DataTableCell>
                        {log.latitude && log.longitude ? (
                          <a
                            href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            View Location
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">No location</span>
                        )}
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </div>
          )}

          <div className="mt-12 pt-8">
            <Accordion type="single" collapsible>
              <AccordionItem value="color-legend" className="border-0">
                <AccordionTrigger className="group px-0 py-0 hover:no-underline">
                  <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        <Zap className="h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 text-white" />
                      </div>
                      <div className="text-left min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold">Attendance Status Guide</h3>
                        <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1 hidden sm:block">Understand the color-coded attendance system</p>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-white transition-colors flex-shrink-0">
                      <svg className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="mt-4 sm:mt-6 bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8">
                  <div className="space-y-10">
                    <div>
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                        <div className="p-2 sm:p-2.5 bg-purple-600 rounded-lg flex-shrink-0">
                          <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-base sm:text-xl text-slate-900 dark:text-white">Check-In Status</h3>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ml-auto flex-shrink-0">Target: 10:00 AM IST</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-purple-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <Zap className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">Before 10:00 AM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">🌟 Appreciated</p>
                            <p className="text-xs sm:text-sm text-purple-100">Early arrival shows dedication and commitment</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-green-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">At 10:00 AM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">✓ Perfect</p>
                            <p className="text-xs sm:text-sm text-green-100">Exactly on time, perfect punctuality</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">10:01 - 10:15 AM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">⏰ Grace Period</p>
                            <p className="text-xs sm:text-sm text-amber-100">Within acceptable grace window</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-red-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <Frown className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">After 10:15 AM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">⚠️ Late</p>
                            <p className="text-xs sm:text-sm text-red-100">Beyond grace period - consider adding note</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                        <div className="p-2 sm:p-2.5 bg-blue-600 rounded-lg flex-shrink-0">
                          <LogOut className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-base sm:text-xl text-slate-900 dark:text-white">Check-Out Status</h3>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ml-auto flex-shrink-0">6:15 PM → 7:00 PM+ IST</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-red-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <Frown className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">Before 6:15 PM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">⚠️ Early</p>
                            <p className="text-xs sm:text-sm text-red-100">Incomplete work hours</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">6:15 - 6:25 PM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">⏰ Grace</p>
                            <p className="text-xs sm:text-sm text-amber-100">Acceptable checkout window</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-green-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">6:25 PM - 7:00 PM</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">✓ Standard</p>
                            <p className="text-xs sm:text-sm text-green-100">Full work hours completed</p>
                          </div>
                        </div>
                        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-purple-400 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-20"></div>
                          <div className="relative">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              <Zap className="h-4 sm:h-5 w-4 sm:w-5" />
                              <span className="font-bold text-xs sm:text-sm">After 7:00 PM 🎉</span>
                            </div>
                            <p className="font-bold text-base sm:text-lg mb-1">⭐ Extra Effort</p>
                            <p className="text-xs sm:text-sm text-purple-100">Beyond standard hours - outstanding!</p>
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
