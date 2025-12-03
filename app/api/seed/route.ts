import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const employeeCollection = await db.employeeProfiles()

    const hashedPassword = await hashPassword("password123")

    const testEmployee = {
      name: "John Doe",
      email: "john@test.com",
      password: hashedPassword,
      employeeCode: "EMP001",
      phone: "1234567890",
      address: "123 Main St",
      city: "Test City",
      state: "TS",
      zipCode: "12345",
      dateOfBirth: new Date("1990-01-01"),
      baseSalary: 50000,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await employeeCollection.deleteOne({ email: "john@test.com" })
    const result = await employeeCollection.insertOne(testEmployee)

    return NextResponse.json(
      {
        message: "Test employee created",
        employee: {
          id: result.insertedId.toString(),
          email: "john@test.com",
          password: "password123",
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Seed Error]", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
