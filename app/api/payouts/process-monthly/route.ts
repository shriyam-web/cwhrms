import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"

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

    const { month, year } = await req.json()

    // Get all employees
    const employees = await prisma.employeeProfile.findMany({
      where: { status: "ACTIVE" },
      include: { user: true },
    })

    const payouts = []

    for (const employee of employees) {
      // Calculate attendance
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const attendanceLogs = await prisma.attendanceLog.findMany({
        where: {
          employeeId: employee.id,
          checkInTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      // Calculate deductions based on attendance
      const workingDays = 22 // Standard working days
      const presentDays = attendanceLogs.filter((log) => log.status === "PRESENT").length
      const absentDays = workingDays - presentDays
      const deductionPerDay = employee.baseSalary / workingDays
      const deductions = absentDays * deductionPerDay

      // Create payout
      const payout = await prisma.payout.create({
        data: {
          employeeId: employee.id,
          userId: employee.userId,
          baseSalary: employee.baseSalary,
          bonus: 0,
          commission: 0,
          deductions,
          netAmount: employee.baseSalary - deductions,
          month,
          year,
          status: "PENDING",
        },
      })

      payouts.push(payout)
    }

    return NextResponse.json(
      { message: `Processed payroll for ${month}/${year}`, payouts, count: payouts.length },
      { status: 200 },
    )
  } catch (error) {
    console.error("[Process Monthly Payroll Error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
