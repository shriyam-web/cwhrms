import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken, hashPassword } from "@/lib/auth"
import { z } from "zod"
import { generateEmployeeCode } from "@/lib/utils"

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  employeeCode: z.string().regex(/^CW\/[A-Z]{3}-\d{4}$/, "Employee code must follow pattern CW/XXX-DDMM").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  baseSalary: z.number().default(0),
  joiningDate: z.string().default(() => new Date().toISOString()),
})

export async function GET(req: NextRequest) {
  try {
    const { db } = await import("@/lib/db")
    const employeeCollection = await db.employeeProfiles()
    
    const employees = await employeeCollection.find({}).toArray()
    
    const formattedEmployees = employees.map((emp) => ({
      id: emp._id.toString(),
      email: emp.email,
      name: emp.name,
      phone: emp.phone,
      city: emp.city,
      baseSalary: emp.baseSalary,
      role: emp.role,
      status: emp.status,
    }))

    return NextResponse.json({ employees: formattedEmployees }, { status: 200 })
  } catch (error) {
    console.error("[Get Employees Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const data = createEmployeeSchema.parse(body)

    // Use provided employee code or auto-generate if city and dateOfBirth are provided
    let employeeCode = data.employeeCode
    if (!employeeCode && data.city && data.dateOfBirth) {
      const dateOfBirth = new Date(data.dateOfBirth)
      employeeCode = generateEmployeeCode(data.city, dateOfBirth)
    }

    const employeeCollection = await db.employeeProfiles()
    
    // Check if employee already exists
    const existingEmployee = await employeeCollection.findOne({ email: data.email })
    if (existingEmployee) {
      return NextResponse.json({ error: "Employee with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(data.password ?? "temp-password")

    const result = await employeeCollection.insertOne({
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      employeeCode,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      baseSalary: data.baseSalary,
      joiningDate: new Date(data.joiningDate),
      password: hashedPassword,
      role: "EMPLOYEE",
      profile: {
        type: "EMPLOYEE",
        verified: false,
        createdAt: new Date(),
      },
      status: "ACTIVE",
      documentUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const employee = {
      id: result.insertedId.toString(),
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      employeeCode,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zipCode: data.zipCode || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      baseSalary: data.baseSalary,
      joiningDate: new Date(data.joiningDate),
      role: "EMPLOYEE",
      status: "ACTIVE",
    }

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Create Employee Validation Error]", error.errors)
      return NextResponse.json({ error: error.errors[0].message, details: error.errors }, { status: 400 })
    }
    console.error("[Create Employee Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
