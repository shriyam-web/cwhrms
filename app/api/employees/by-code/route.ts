import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const searchSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
})

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
    const { employeeCode } = searchSchema.parse(body)

    const employeeCollection = await db.employeeProfiles()
    const employee = await employeeCollection.findOne({ employeeCode })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const formattedEmployee = {
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      employeeCode: employee.employeeCode,
      phone: employee.phone,
      status: employee.status,
    }

    return NextResponse.json({ employee: formattedEmployee }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Search Employee Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
