import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, hashPassword } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    console.log("[Employees GET] Auth header:", authHeader ? "present" : "missing")
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[Employees GET] No bearer token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (!payload) {
      console.log("[Employees GET] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const employeeCollection = await db.employeeProfiles()
    const employees = await employeeCollection
      .find({})
      .sort({ name: 1 })
      .toArray()

    console.log("[Employees GET] Found employees count:", employees.length)

    const formattedEmployees = employees.map((emp) => ({
      id: emp._id.toString(),
      name: emp.name,
      employeeCode: emp.employeeCode,
      email: emp.email,
      phone: emp.phone,
      position: emp.profile?.type || emp.position || "",
      status: emp.status,
      role: emp.role || "EMPLOYEE",
    }))

    return NextResponse.json({ employees: formattedEmployees }, { status: 200 })
  } catch (error) {
    console.error("[Get Employees Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const { name, email, password, employeeCode, phone, position, address, city, state, zipCode, dateOfBirth, baseSalary, role } = body

    if (!name || !email || !password || !employeeCode) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, employeeCode" },
        { status: 400 }
      )
    }

  

    const employeeCollection = await db.employeeProfiles()

    const existingEmployee = await employeeCollection.findOne({ email })
    if (existingEmployee) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const newEmployee = {
      name,
      email,
      password: hashedPassword,
      employeeCode,
      phone: phone || "",
      position: position || "",
      address: address || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      baseSalary: baseSalary || 0,
      role: role || "EMPLOYEE",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await employeeCollection.insertOne(newEmployee)

    return NextResponse.json(
      {
        message: "Employee created successfully",
        employee: {
          id: result.insertedId.toString(),
          ...newEmployee,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Create Employee Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
