import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: {
        employee: { include: { user: true } },
        agent: { include: { user: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 })
    }

    return NextResponse.json({ payout }, { status: 200 })
  } catch (error) {
    console.error("[Get Payout Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const { status, payoutDate } = body

    const payout = await prisma.payout.update({
      where: { id: params.id },
      data: {
        status,
        ...(payoutDate && { payoutDate: new Date(payoutDate) }),
      },
      include: {
        employee: true,
        agent: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ payout }, { status: 200 })
  } catch (error) {
    console.error("[Update Payout Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
