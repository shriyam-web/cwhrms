"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateEmployeeForm } from "@/components/forms/create-employee-form"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"

interface Employee {
  id: string
  email: string
  name: string
  employeeCode: string
  phone?: string
  position?: string
  status: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get<{ employees: Employee[] }>("/api/employees")
      console.log("API response:", response)
      setEmployees(response.employees || response.data?.employees || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch employees"
      toast.error(errorMessage)
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/employees/${id}`)
      toast.success("Employee deleted successfully")
      setEmployees(employees.filter(emp => emp.id !== id))
    } catch (error) {
      toast.error("Failed to delete employee")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setOpenDialog(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setOpenDialog(open)
    if (!open) {
      setEditingEmployee(null)
    }
  }

  const handleCloseDialog = () => {
    handleDialogOpenChange(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Employees
            </h1>
            <p className="text-muted-foreground mt-2">Manage your workforce</p>
          </div>
          <Button onClick={() => setOpenDialog(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <DataTable searchPlaceholder="Search employees...">
          <DataTableHead>
            <DataTableHeader>Name</DataTableHeader>
            <DataTableHeader>Employee Code</DataTableHeader>
            <DataTableHeader>Position</DataTableHeader>
            <DataTableHeader>Email</DataTableHeader>
            <DataTableHeader>Phone</DataTableHeader>
            <DataTableHeader>Status</DataTableHeader>
            <DataTableHeader>Actions</DataTableHeader>
          </DataTableHead>
          <DataTableBody>
            {loading ? (
              <DataTableRow>
                <DataTableCell colSpan={7} className="text-center py-8">
                  <div>Loading employees...</div>
                </DataTableCell>
              </DataTableRow>
            ) : employees.length === 0 ? (
              <DataTableRow>
                <DataTableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">No employees found</div>
                </DataTableCell>
              </DataTableRow>
            ) : (
              employees.map((emp) => (
                <DataTableRow key={emp.id}>
                  <DataTableCell>
                    <div className="font-medium">{emp.name}</div>
                  </DataTableCell>
                  <DataTableCell>{emp.employeeCode}</DataTableCell>
                  <DataTableCell>{emp.position || "-"}</DataTableCell>
                  <DataTableCell>{emp.email}</DataTableCell>
                  <DataTableCell>{emp.phone || "-"}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge status={emp.status} variant="success" />
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-950"
                        onClick={() => handleEdit(emp)}
                      >
                        <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-950"
                        onClick={() => handleDelete(emp.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>

      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          <CreateEmployeeForm 
            editingEmployee={editingEmployee} 
            onSuccess={fetchEmployees} 
            onClose={handleCloseDialog} 
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
