"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, TrendingUp } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { DataTable, DataTableHead, DataTableBody, DataTableRow, DataTableHeader, DataTableCell } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"

const performanceData = [
  { name: "Week 1", achieved: 25, target: 100 },
  { name: "Week 2", achieved: 45, target: 100 },
  { name: "Week 3", achieved: 70, target: 100 },
  { name: "Week 4", achieved: 95, target: 100 },
]

const leaderboard = [
  { rank: 1, name: "Vikram Sharma", target: "Sales", achieved: "95%", status: "On Track" },
  { rank: 2, name: "Neha Gupta", target: "Leads", achieved: "87%", status: "On Track" },
  { rank: 3, name: "Arjun Singh", target: "Revenue", achieved: "72%", status: "Needs Attention" },
]

export default function TargetsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Targets & Performance
            </h1>
            <p className="text-muted-foreground mt-2">Track agent performance and targets</p>
          </div>
          <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-4 w-4" />
            Assign Target
          </Button>
        </div>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Weekly Performance</h3>
              <p className="text-sm text-muted-foreground">Target achievement over time</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performanceData}>
                <defs>
                  <linearGradient id="achievedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="achieved" fill="url(#achievedGradient)" name="Achieved" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="url(#targetGradient)" name="Target" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold">Agent Leaderboard</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Agent Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Target Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Achievement</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item) => (
                    <tr key={item.rank} className="border-b hover:bg-muted/70 transition-colors duration-200">
                      <td className="py-3 px-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-sm font-bold">
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium">
                          {item.target}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: item.achieved }}></div>
                          </div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.achieved}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={item.status}
                          variant={item.status === "On Track" ? "success" : "warning"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search targets..." className="max-w-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { agent: "Vikram Sharma", metric: "Monthly Sales", target: 500000, achieved: 475000 },
                { agent: "Neha Gupta", metric: "Lead Generation", target: 150, achieved: 130 },
                { agent: "Arjun Singh", metric: "Revenue", target: 1000000, achieved: 720000 },
              ].map((item, idx) => (
                <Card key={idx} className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{item.agent}</h4>
                      <p className="text-sm text-muted-foreground">{item.metric}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">₹{item.achieved.toLocaleString()}</span>
                        <span className="text-muted-foreground">/ ₹{item.target.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${(item.achieved / item.target) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs font-semibold text-right text-green-600 dark:text-green-400">
                        {Math.round((item.achieved / item.target) * 100)}% completed
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
