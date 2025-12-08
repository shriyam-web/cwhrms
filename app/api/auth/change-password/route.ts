import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, hashPassword, verifyToken } from "@/lib/auth"
import { z } from "zod"
import { ObjectId } from "mongodb"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    const employeeCollection = await db.employeeProfiles()
    const employee = await employeeCollection.findOne({ _id: new ObjectId(decoded.id) })

    if (!employee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!employee.password) {
      return NextResponse.json({ error: "Password not set for this account" }, { status: 400 })
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, employee.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    const hashedPassword = await hashPassword(newPassword)

    await employeeCollection.updateOne(
      { _id: new ObjectId(decoded.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    )

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Change Password Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
