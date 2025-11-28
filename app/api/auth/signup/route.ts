import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, generateToken, generateEmployeeId } from "@/lib/auth"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  cityCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{3}$/, "City code must be 3 letters")
    .optional(),
  role: z.enum(["EMPLOYEE", "AGENT", "HR", "ADMIN"]).default("EMPLOYEE"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("[Signup] Request received")
    const body = await req.json()
    console.log("[Signup] Parsing request body")
    const { email, password, name, phone, role, birthDate, cityCode } = signupSchema.parse(body)
    console.log("[Signup] Creating user:", { email, name, role })

    try {
      const employeeCollection = await db.employeeProfiles()
      
      const existingEmployee = await employeeCollection.findOne({ email })
      if (existingEmployee) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 })
      }

      const hashedPassword = await hashPassword(password)

      if (role === "EMPLOYEE" || role === "HR" || role === "ADMIN") {
        const normalizedCityCode = cityCode ? cityCode.toUpperCase() : null
        let parsedBirthDate: Date | null = null
        if (birthDate) {
          try {
            const dateValue = new Date(birthDate)
            parsedBirthDate = isNaN(dateValue.getTime()) ? null : dateValue
          } catch (err) {
            console.error("[Birth Date Parsing Error]", err)
          }
        }

        let employeeCode = "CW/IND-0000"
        if (parsedBirthDate && normalizedCityCode) {
          try {
            employeeCode = generateEmployeeId(parsedBirthDate, normalizedCityCode)
          } catch (err) {
            console.error("[Employee Code Generation Error]", err)
          }
        }

        const result = await employeeCollection.insertOne({
          employeeCode,
          dateOfBirth: parsedBirthDate,
          cityCode: normalizedCityCode,
          joiningDate: new Date(),
          email,
          name,
          phone: phone || null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          baseSalary: null,
          password: hashedPassword,
          role: role,
          profile: {
            type: role,
            verified: false,
            createdAt: new Date(),
          },
          status: "ACTIVE",
          documentUrls: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const employeeId = result.insertedId.toString()
        const token = generateToken({
          id: employeeId,
          email,
          role,
        })

        return NextResponse.json(
          {
            message: "User created successfully",
            user: {
              id: employeeId,
              email,
              name,
              role,
            },
            token,
          },
          { status: 201 },
        )
      }

      if (role === "AGENT") {
        const agentCollection = await db.agentProfiles()
        const existingAgent = await agentCollection.findOne({ email })
        if (existingAgent) {
          return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const result = await agentCollection.insertOne({
          joiningDate: new Date(),
          email,
          name,
          phone: phone || null,
          address: null,
          commissionRate: null,
          password: hashedPassword,
          role: role,
          profile: {
            type: "AGENT",
            verified: false,
            createdAt: new Date(),
          },
          status: "ACTIVE",
          documentUrls: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const agentId = result.insertedId.toString()
        const token = generateToken({
          id: agentId,
          email,
          role,
        })

        return NextResponse.json(
          {
            message: "User created successfully",
            user: {
              id: agentId,
              email,
              name,
              role,
            },
            token,
          },
          { status: 201 },
        )
      }

      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      )
    } catch (dbError) {
      console.error("[Signup DB Error]", dbError)
      throw dbError
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Signup Validation Error]", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Signup Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    console.error("[Signup Error Message]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
