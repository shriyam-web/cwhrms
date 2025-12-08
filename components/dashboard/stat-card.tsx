"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"

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
    <Card className={`relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 transform group`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight truncate">{value}</p>
            <div className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold flex-shrink-0 px-2.5 py-1 rounded-full ${
              isPositive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}>
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(change)}%
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate font-medium">{changeLabel}</p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="relative z-10 mt-4 sm:mt-5 h-10 -mx-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                dot={false}
                strokeWidth={2.5}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent"></div>
    </Card>
  )
}
