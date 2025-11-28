import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"

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

    // Get active targets with achievement percentages
    const targets = await prisma.target.findMany({
      where: { status: "ACTIVE" },
      include: {
        agent: { include: { user: true } },
      },
    })

    // Calculate achievement percentage and create leaderboard
    const leaderboard = targets
      .map((target) => ({
        rank: 0,
        agentId: target.agentId,
        agentName: target.agent.user.name,
        targetMetric: target.targetMetric,
        targetValue: target.targetValue,
        achievedValue: target.achievedValue,
        achievementPercentage: (target.achievedValue / target.targetValue) * 100,
        status: target.achievedValue >= target.targetValue ? "COMPLETED" : "IN_PROGRESS",
      }))
      .sort((a, b) => b.achievementPercentage - a.achievementPercentage)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }))

    return NextResponse.json({ leaderboard }, { status: 200 })
  } catch (error) {
    console.error("[Leaderboard Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
