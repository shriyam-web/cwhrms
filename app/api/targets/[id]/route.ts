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

    const target = await prisma.target.findUnique({
      where: { id: params.id },
      include: {
        agent: { include: { user: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!target) {
      return NextResponse.json({ error: "Target not found" }, { status: 404 })
    }

    return NextResponse.json({ target }, { status: 200 })
  } catch (error) {
    console.error("[Get Target Error]", error)
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
    const { achievedValue, status } = body

    const target = await prisma.target.update({
      where: { id: params.id },
      data: {
        ...(achievedValue !== undefined && { achievedValue }),
        ...(status && { status }),
      },
      include: {
        agent: { include: { user: true } },
        assignedBy: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ target }, { status: 200 })
  } catch (error) {
    console.error("[Update Target Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    await prisma.target.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Target deleted" }, { status: 200 })
  } catch (error) {
    console.error("[Delete Target Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
