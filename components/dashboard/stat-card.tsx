"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  sparklineData: Array<{ value: number }>
  gradient?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  sparklineData,
  gradient = "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
}: StatCardProps) {
  const isPositive = change >= 0

  return (
    <Card className={`relative overflow-hidden p-6 bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{changeLabel}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-slate-800 shadow-md">
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-8 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                dot={false}
                strokeWidth={2}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
