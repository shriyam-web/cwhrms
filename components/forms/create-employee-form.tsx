"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { generateEmployeeCode } from "@/lib/utils"

interface CreateEmployeeFormProps {
  onSuccess: () => void
  onClose: () => void
  editingEmployee?: any
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0]
}

const buildFormData = (employee?: any) => ({
  name: employee?.user?.name || "",
  email: employee?.email || "",
  phone: employee?.phone || "",
  password: "",
  employeeCode: employee?.employeeCode || "",
  address: employee?.address || "",
  city: employee?.city || "",
  state: employee?.state || "",
  zipCode: employee?.zipCode || "",
  dateOfBirth: formatDate(employee?.dateOfBirth),
  baseSalary: employee?.baseSalary ?? 0,
})

export function CreateEmployeeForm({ onSuccess, onClose, editingEmployee }: CreateEmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(() => buildFormData(editingEmployee))
  const [passwordError, setPasswordError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "baseSalary" ? Number(value) : value,
    }))
    
    if (name === "password") {
      if (value && value.length < 6) {
        setPasswordError("Password must be at least 6 characters")
      } else {
        setPasswordError("")
      }
    }
  }

  useEffect(() => {
    setFormData(buildFormData(editingEmployee))
    setPasswordError("")
  }, [editingEmployee])

  // Auto-generate employee code when city and dateOfBirth are available
  useEffect(() => {
    if (editingEmployee) return
    if (formData.city && formData.dateOfBirth) {
      const dateOfBirth = new Date(formData.dateOfBirth)
      const generatedCode = generateEmployeeCode(formData.city, dateOfBirth)
      setFormData((prev) => ({
        ...prev,
        employeeCode: generatedCode,
      }))
    }
  }, [editingEmployee, formData.city, formData.dateOfBirth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    setLoading(true)

    try {
      if (editingEmployee) {
        const updateData = {
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          baseSalary: formData.baseSalary,
        }
        await apiClient.put(`/api/employees/${editingEmployee.id}`, updateData)
        toast.success("Employee updated successfully")
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.password && { password: formData.password }),
          ...(formData.employeeCode && { employeeCode: formData.employeeCode }),
          ...(formData.address && { address: formData.address }),
          ...(formData.city && { city: formData.city }),
          ...(formData.state && { state: formData.state }),
          ...(formData.zipCode && { zipCode: formData.zipCode }),
          ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
          baseSalary: formData.baseSalary,
        }
        console.log("Creating employee with data:", createData)
        await apiClient.post("/api/employees", createData)
        toast.success("Employee created successfully")
      }
      onSuccess()
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save employee"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1">Name *</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            disabled={!!editingEmployee}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium block mb-1">Email *</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@company.com"
            disabled={!!editingEmployee}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium block mb-1">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91-9876543210"
          />
        </div>
        {!editingEmployee && (
          <div>
            <label htmlFor="password" className="text-sm font-medium block mb-1">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank for temporary password"
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
        )}
        <div>
          <label htmlFor="dateOfBirth" className="text-sm font-medium block mb-1">Date of Birth *</label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            disabled={!!editingEmployee}
            required
          />
        </div>
        <div>
          <label htmlFor="employeeCode" className="text-sm font-medium block mb-1">Employee Code</label>
          <Input
            id="employeeCode"
            name="employeeCode"
            value={formData.employeeCode}
            onChange={handleChange}
            placeholder="Auto-generated"
            disabled={!!editingEmployee}
          />
        </div>
        <div>
          <label htmlFor="baseSalary" className="text-sm font-medium block mb-1">Base Salary</label>
          <Input
            id="baseSalary"
            name="baseSalary"
            type="number"
            value={formData.baseSalary}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="address" className="text-sm font-medium block mb-1">Address</label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street Address"
          />
        </div>
        <div>
          <label htmlFor="city" className="text-sm font-medium block mb-1">City *</label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        <div>
          <label htmlFor="state" className="text-sm font-medium block mb-1">State</label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
        <div>
          <label htmlFor="zipCode" className="text-sm font-medium block mb-1">Zip Code</label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="560001"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (editingEmployee ? "Updating..." : "Creating...") : (editingEmployee ? "Update Employee" : "Create Employee")}
        </Button>
      </div>
    </form>
  )
}
