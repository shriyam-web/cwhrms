import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"
import { ObjectId } from "mongodb"

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  employeeCode: z.string().regex(/^CW\/[A-Z]{3}-\d{4}$/, "Employee code must follow pattern CW/XXX-DDMM").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  baseSalary: z.number().optional(),
}).strict()

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const employeeCollection = await db.employeeProfiles()
    let employeeId: ObjectId
    try {
      employeeId = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const employee = await employeeCollection.findOne({ _id: employeeId })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const formattedEmployee = {
      id: employee._id.toString(),
      email: employee.email,
      name: employee.name,
      phone: employee.phone,
      city: employee.city,
      baseSalary: employee.baseSalary,
      role: employee.role,
      status: employee.status,
      employeeCode: employee.employeeCode,
      address: employee.address,
      state: employee.state,
      zipCode: employee.zipCode,
      dateOfBirth: employee.dateOfBirth,
      joiningDate: employee.joiningDate,
    }

    return NextResponse.json({ employee: formattedEmployee }, { status: 200 })
  } catch (error) {
    console.error("[Get Employee Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateEmployeeSchema.parse(body)

    const employeeCollection = await db.employeeProfiles()
    let employeeId: ObjectId
    try {
      employeeId = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (data.name) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.employeeCode) updateData.employeeCode = data.employeeCode
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.state !== undefined) updateData.state = data.state
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode
    if (data.baseSalary !== undefined) updateData.baseSalary = data.baseSalary

    await employeeCollection.updateOne(
      { _id: employeeId },
      { $set: updateData }
    )

    const updatedEmployee = await employeeCollection.findOne({ _id: employeeId })

    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const formattedEmployee = {
      id: updatedEmployee._id.toString(),
      email: updatedEmployee.email,
      name: updatedEmployee.name,
      phone: updatedEmployee.phone,
      city: updatedEmployee.city,
      baseSalary: updatedEmployee.baseSalary,
      role: updatedEmployee.role,
      status: updatedEmployee.status,
    }

    return NextResponse.json({ employee: formattedEmployee }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Update Employee Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const employeeCollection = await db.employeeProfiles()
    let employeeId: ObjectId
    try {
      employeeId = new ObjectId(id)
    } catch {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const result = await employeeCollection.deleteOne({ _id: employeeId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Employee deleted" }, { status: 200 })
  } catch (error) {
    console.error("[Delete Employee Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
