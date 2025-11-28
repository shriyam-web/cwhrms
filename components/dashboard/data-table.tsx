"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DataTableProps {
  searchPlaceholder: string
  children: React.ReactNode
}

export function DataTable({ searchPlaceholder, children }: DataTableProps) {
  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder={searchPlaceholder} className="max-w-sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {children}
          </table>
        </div>
      </div>
    </Card>
  )
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b bg-muted/50">
        {children}
      </tr>
    </thead>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function DataTableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b hover:bg-muted/70 transition-colors duration-200">
      {children}
    </tr>
  )
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return <th className="text-left py-3 px-4 font-semibold text-muted-foreground">{children}</th>
}

export function DataTableCell({ children }: { children: React.ReactNode }) {
  return <td className="py-3 px-4">{children}</td>
}
