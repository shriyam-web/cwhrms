"use client"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface PayslipData {
  employeeName: string
  employeeId: string
  month: string
  year: string
  baseSalary: number
  bonus: number
  commission: number
  deductions: number
  netAmount: number
}

export function PayslipPDF({ data }: { data: PayslipData }) {
  const payslipRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!payslipRef.current) return

    try {
      const canvas = await html2canvas(payslipRef.current)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297)
      pdf.save(`payslip_${data.employeeId}_${data.month}_${data.year}.pdf`)
    } catch (error) {
      console.error("PDF generation failed:", error)
    }
  }

  return (
    <>
      <Button onClick={generatePDF} className="gap-2 bg-transparent" variant="outline">
        <Download className="h-4 w-4" />
        Download Payslip
      </Button>

      <div ref={payslipRef} className="hidden p-8 bg-white">
        <div className="border-2 border-black p-6 max-w-2xl">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-2xl font-bold">PAYSLIP</h1>
            <p className="text-sm">
              {data.month}/{data.year}
            </p>
          </div>

          {/* Employee Details */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Employee Name:</p>
              <p className="text-sm">{data.employeeName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Employee ID:</p>
              <p className="text-sm">{data.employeeId}</p>
            </div>
          </div>

          {/* Earnings */}
          <div className="mb-4 border-t border-b py-2">
            <h2 className="font-semibold text-sm mb-2">EARNINGS</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td>Base Salary</td>
                  <td className="text-right">₹{data.baseSalary.toLocaleString()}</td>
                </tr>
                {data.bonus > 0 && (
                  <tr>
                    <td>Bonus</td>
                    <td className="text-right">₹{data.bonus.toLocaleString()}</td>
                  </tr>
                )}
                {data.commission > 0 && (
                  <tr>
                    <td>Commission</td>
                    <td className="text-right">₹{data.commission.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="border-t font-semibold">
                  <td>Total Earnings</td>
                  <td className="text-right">₹{(data.baseSalary + data.bonus + data.commission).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          {data.deductions > 0 && (
            <div className="mb-4 border-t border-b py-2">
              <h2 className="font-semibold text-sm mb-2">DEDUCTIONS</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td>Deductions</td>
                    <td className="text-right">₹{data.deductions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Net Amount */}
          <div className="mb-4 border-2 border-black p-2 text-center">
            <p className="text-sm font-bold">Net Amount: ₹{data.netAmount.toLocaleString()}</p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs mt-6 border-t pt-4">
            <p>This is a computer-generated payslip</p>
          </div>
        </div>
      </div>
    </>
  )
}
