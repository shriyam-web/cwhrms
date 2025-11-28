"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface TargetCardProps {
  agentName: string
  targetMetric: string
  targetValue: number
  achievedValue: number
  status: string
}

export function TargetCard({ agentName, targetMetric, targetValue, achievedValue, status }: TargetCardProps) {
  const percentage = Math.min((achievedValue / targetValue) * 100, 100)

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{agentName}</h3>
          <p className="text-sm text-muted-foreground capitalize">{targetMetric}</p>
        </div>
        <Badge variant={status === "COMPLETED" ? "default" : "secondary"}>{status}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{achievedValue.toLocaleString()}</span>
          <span className="text-muted-foreground">{targetValue.toLocaleString()}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}% complete</p>
      </div>
    </Card>
  )
}
