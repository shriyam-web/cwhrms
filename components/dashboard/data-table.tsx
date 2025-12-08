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
    <Card className="p-0 shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
      <div className="space-y-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/50">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input placeholder={searchPlaceholder} className="border-0 bg-transparent focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
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
      <tr className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 border-b border-slate-700 dark:border-slate-800">
        {children}
      </tr>
    </thead>
  )
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">{children}</tbody>
}

export function DataTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-blue-50 dark:hover:bg-slate-900/40 transition-colors duration-200 ${className || ""}`}>
      {children}
    </tr>
  )
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return <th className="text-left py-2.5 px-3 font-semibold text-white dark:text-slate-200 text-xs tracking-wider uppercase">{children}</th>
}

export function DataTableCell({ children, colSpan, className }: { children: React.ReactNode; colSpan?: number; className?: string }) {
  return <td colSpan={colSpan} className={`py-2.5 px-3 text-slate-700 dark:text-slate-300 ${className || ""}`}>{children}</td>
}
