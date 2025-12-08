"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react"

interface AttendanceStatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  gradient: string
  trend?: string
  description?: string
}

export function AttendanceStatsCard({
  label,
  value,
  icon,
  gradient,
  trend,
  description,
}: AttendanceStatsCardProps) {
  return (
    <Card className={`relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br ${gradient} group hover:scale-105 transform`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80">{label}</span>
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
            {icon}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-4xl sm:text-5xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-xs sm:text-sm text-white/90 font-medium">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
              <TrendingUp className="w-3.5 h-3.5" />
              {trend}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent"></div>
    </Card>
  )
}
