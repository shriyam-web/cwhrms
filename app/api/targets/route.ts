import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"
import { ObjectId } from "mongodb"

const createTargetSchema = z.object({
  agentId: z.string(),
  targetValue: z.number().positive(),
  targetMetric: z.string(), // 'sales', 'leads', 'revenue'
  startDate: z.string(),
  endDate: z.string(),
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
    const agentId = searchParams.get("agentId")

    const where: any = {}
    if (agentId) where.agentId = agentId

    const targets = await prisma.target.findMany({
      where,
      include: {
        agent: { include: { user: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json({ targets }, { status: 200 })
  } catch (error) {
    console.error("[Get Targets Error]", error)
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
    const data = createTargetSchema.parse(body)

    const target = await prisma.target.create({
      data: {
        ...data,
        assignedById: payload.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "ACTIVE",
        achievedValue: 0,
      },
      include: {
        agent: { include: { user: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ target }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Create Target Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
