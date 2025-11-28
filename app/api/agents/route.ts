import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const createAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  commissionRate: z.number().default(10),
  joiningDate: z.string().default(() => new Date().toISOString()),
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

    const agents = await prisma.agentProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true, role: true } } },
    })

    return NextResponse.json({ agents }, { status: 200 })
  } catch (error) {
    console.error("[Get Agents Error]", error)
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
    const data = createAgentSchema.parse(body)

    const agent = await prisma.agentProfile.create({
      data: {
        user: {
          create: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: "AGENT",
            password: "temp-password",
          },
        },
        email: data.email,
        phone: data.phone,
        address: data.address,
        commissionRate: data.commissionRate,
        joiningDate: new Date(data.joiningDate),
      },
      include: { user: true },
    })

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Create Agent Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
