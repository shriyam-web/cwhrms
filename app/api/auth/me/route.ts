import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[Get Me] No authorization header")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const token = authHeader.slice(7)
    console.log("[Get Me] Verifying token")
    const payload = verifyToken(token)

    if (!payload) {
      console.log("[Get Me] Invalid token")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    console.log("[Get Me] Getting employee:", payload.id)
    
    let employeeId: ObjectId
    try {
      employeeId = new ObjectId(payload.id)
    } catch (err) {
      console.error("[Get Me] Invalid ObjectId:", payload.id, err)
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const employeeCollection = await db.employeeProfiles()
    const employee = await employeeCollection.findOne(
      { _id: employeeId },
      {
        projection: {
          email: 1,
          name: 1,
          phone: 1,
          role: 1,
          lastLogin: 1,
          status: 1,
          profile: 1,
          employeeCode: 1,
          _id: 1,
        },
      }
    )

    if (!employee) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        user: {
          id: employee._id.toString(),
          email: employee.email,
          name: employee.name,
          phone: employee.phone,
          role: employee.role,
          isActive: employee.status === "ACTIVE",
          lastLogin: employee.lastLogin,
          profile: employee.profile || { type: employee.role || "EMPLOYEE", verified: false, createdAt: new Date() },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Get Me Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message, user: null }, { status: 500 })
  }
}
