"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"

const agents = [
  {
    id: 1,
    name: "Vikram Sharma",
    email: "vikram@company.com",
    phone: "+91-9876543220",
    commission: "12%",
    status: "Active",
    targets: "₹5L",
  },
  {
    id: 2,
    name: "Neha Gupta",
    email: "neha@company.com",
    phone: "+91-9876543221",
    commission: "10%",
    status: "Active",
    targets: "₹4.5L",
  },
]

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Agents
            </h1>
            <p className="text-muted-foreground mt-2">Manage sales and business agents</p>
          </div>
          <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-4 w-4" />
            Add Agent
          </Button>
        </div>

        <DataTable searchPlaceholder="Search agents...">
          <DataTableHead>
            <DataTableHeader>Name</DataTableHeader>
            <DataTableHeader>Email</DataTableHeader>
            <DataTableHeader>Phone</DataTableHeader>
            <DataTableHeader>Commission</DataTableHeader>
            <DataTableHeader>Monthly Target</DataTableHeader>
            <DataTableHeader>Status</DataTableHeader>
            <DataTableHeader>Actions</DataTableHeader>
          </DataTableHead>
          <DataTableBody>
            {agents.map((agent) => (
              <DataTableRow key={agent.id}>
                <DataTableCell>
                  <div className="font-medium">{agent.name}</div>
                </DataTableCell>
                <DataTableCell>{agent.email}</DataTableCell>
                <DataTableCell>{agent.phone}</DataTableCell>
                <DataTableCell>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{agent.commission}</span>
                </DataTableCell>
                <DataTableCell>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{agent.targets}</span>
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={agent.status} variant="success" />
                </DataTableCell>
                <DataTableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-950">
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </DashboardLayout>
  )
}
