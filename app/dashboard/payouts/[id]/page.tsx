"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PayslipPDF } from "@/components/payslip/payslip-pdf"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface Payout {
  id: string
  baseSalary: number
  bonus: number
  commission: number
  deductions: number
  netAmount: number
  status: string
  month: number
  year: number
  user: { name: string; id: string }
  employee?: { id: string }
}

export default function PayoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payout, setPayout] = useState<Payout | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const response = await apiClient.get<Payout>(`/api/payouts/${params.id}`)
        setPayout(response.payout as Payout)
      } catch (error) {
        console.error("Failed to fetch payout:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchPayout()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!payout) {
    return (
      <DashboardLayout>
        <div className="text-center">Payout not found</div>
      </DashboardLayout>
    )
  }

  const monthName = new Date(payout.year, payout.month - 1).toLocaleString("default", { month: "long" })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Payslip</h1>
            <p className="text-muted-foreground">
              {payout.user.name} - {monthName} {payout.year}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Base Salary</p>
              <p className="text-2xl font-bold">₹{(payout.baseSalary || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bonus</p>
              <p className="text-2xl font-bold">₹{(payout.bonus || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deductions</p>
              <p className="text-2xl font-bold text-red-600">-₹{(payout.deductions || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{(payout.netAmount || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="mb-4">
              <strong>Status:</strong>{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  payout.status === "PAID"
                    ? "bg-green-100 text-green-800"
                    : payout.status === "PROCESSED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {payout.status}
              </span>
            </p>

            <PayslipPDF
              data={{
                employeeName: payout.user.name,
                employeeId: payout.employee?.id || "N/A",
                month: monthName,
                year: payout.year.toString(),
                baseSalary: payout.baseSalary,
                bonus: payout.bonus,
                commission: payout.commission,
                deductions: payout.deductions,
                netAmount: payout.netAmount,
              }}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
