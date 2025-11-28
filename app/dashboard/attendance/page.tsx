"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { QrCode, Clock, LogOut } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"

const attendanceLogs = [
  { id: 1, name: "Rajesh Kumar", checkIn: "09:15 AM", checkOut: "06:30 PM", status: "Present" },
  { id: 2, name: "Priya Singh", checkIn: "09:45 AM", checkOut: "06:45 PM", status: "Late" },
  { id: 3, name: "Amit Patel", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present" },
]

export default function AttendancePage() {
  const router = useRouter()

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
                  <div className="font-medium">{log.name}</div>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{log.checkIn}</span>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span>{log.checkOut}</span>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge 
                    status={log.status} 
                    variant={log.status === "Present" ? "success" : "warning"}
                  />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </DashboardLayout>
  )
}
