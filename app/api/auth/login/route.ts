import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"
import { z } from "zod"
import { ObjectId } from "mongodb"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    try {
      const employeeCollection = await db.employeeProfiles()

      const employee = await employeeCollection.findOne({ email })

      if (!employee) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      if (!employee.password) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      const isPasswordValid = await verifyPassword(password, employee.password)

      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      const isActive = employee.status === "ACTIVE"

      if (!isActive) {
        return NextResponse.json({ error: "User account is inactive" }, { status: 403 })
      }

      const lastLogin = new Date()

      await employeeCollection.updateOne(
        { _id: employee._id },
        { $set: { lastLogin } }
      )

      const role = employee.role || "EMPLOYEE"
      const userName = employee.name || employee.fullName || email
      const userId = employee._id.toString()

      const token = generateToken({
        id: userId,
        email: employee.email,
        role,
      })

      return NextResponse.json(
        {
          message: "Login successful",
          user: {
            id: userId,
            email: employee.email,
            name: userName,
            role,
          },
          token,
        },
        { status: 200 },
      )
    } catch (dbError) {
      console.error("[Login DB Error]", dbError)
      throw dbError
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Login Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
