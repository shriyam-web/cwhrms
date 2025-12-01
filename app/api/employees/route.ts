import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
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
    const employees = await employeeCollection
      .find({ status: "ACTIVE" })
      .sort({ name: 1 })
      .toArray()

    const formattedEmployees = employees.map((emp) => ({
      id: emp._id.toString(),
      name: emp.name,
      employeeCode: emp.employeeCode,
      email: emp.email,
      phone: emp.phone,
      status: emp.status,
    }))

    return NextResponse.json({ employees: formattedEmployees }, { status: 200 })
  } catch (error) {
    console.error("[Get Employees Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
