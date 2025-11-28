import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const createPayoutSchema = z.object({
  employeeId: z.string().optional(),
  agentId: z.string().optional(),
  baseSalary: z.number().default(0),
  bonus: z.number().default(0),
  commission: z.number().default(0),
  deductions: z.number().default(0),
  month: z.number().min(1).max(12),
  year: z.number(),
})

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

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (month) where.month = Number.parseInt(month)
    if (year) where.year = Number.parseInt(year)

    const payouts = await prisma.payout.findMany({
      where,
      include: {
        employee: true,
        agent: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ payouts }, { status: 200 })
  } catch (error) {
    console.error("[Get Payouts Error]", error)
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
    const data = createPayoutSchema.parse(body)

    const netAmount = data.baseSalary + data.bonus + data.commission - data.deductions

    const payout = await prisma.payout.create({
      data: {
        ...data,
        userId: payload.id,
        netAmount,
        status: "PENDING",
      },
      include: {
        employee: true,
        agent: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ payout }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Create Payout Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
