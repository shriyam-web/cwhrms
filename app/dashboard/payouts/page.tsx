"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"

const payouts = [
  {
    id: 1,
    name: "Rajesh Kumar",
    baseSalary: "₹50,000",
    bonus: "₹5,000",
    commission: "₹0",
    deductions: "₹2,000",
    total: "₹53,000",
    status: "Paid",
    month: "Nov 2024",
  },
  {
    id: 2,
    name: "Priya Singh",
    baseSalary: "₹45,000",
    bonus: "₹3,000",
    commission: "₹0",
    deductions: "₹1,500",
    total: "₹46,500",
    status: "Processed",
    month: "Nov 2024",
  },
]

export default function PayoutsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Payouts
            </h1>
            <p className="text-muted-foreground mt-2">Manage salary and commission payouts</p>
          </div>
          <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <CheckCircle className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>

        <DataTable searchPlaceholder="Search payouts...">
          <DataTableHead>
            <DataTableHeader>Name</DataTableHeader>
            <DataTableHeader>Base Salary</DataTableHeader>
            <DataTableHeader>Bonus</DataTableHeader>
            <DataTableHeader>Commission</DataTableHeader>
            <DataTableHeader>Deductions</DataTableHeader>
            <DataTableHeader>Total</DataTableHeader>
            <DataTableHeader>Status</DataTableHeader>
            <DataTableHeader>Actions</DataTableHeader>
          </DataTableHead>
          <DataTableBody>
            {payouts.map((payout) => (
              <DataTableRow key={payout.id}>
                <DataTableCell>
                  <div className="font-medium">{payout.name}</div>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-slate-600 dark:text-slate-400">{payout.baseSalary}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-green-600 dark:text-green-400 font-semibold">{payout.bonus}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{payout.commission}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="text-red-600 dark:text-red-400 font-semibold">{payout.deductions}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{payout.total}</span>
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge 
                    status={payout.status} 
                    variant={payout.status === "Paid" ? "success" : "info"}
                  />
                </DataTableCell>
                <DataTableCell>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-100 dark:hover:bg-blue-950">
                    <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs">Slip</span>
                  </Button>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </DashboardLayout>
  )
}
