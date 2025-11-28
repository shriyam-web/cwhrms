"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { useAuth } from "@/lib/use-auth"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Zap, CheckCircle, Banknote, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const attendanceData = [
  { name: "Mon", present: 45, absent: 5, late: 3 },
  { name: "Tue", present: 48, absent: 2, late: 3 },
  { name: "Wed", present: 47, absent: 3, late: 3 },
  { name: "Thu", present: 46, absent: 4, late: 3 },
  { name: "Fri", present: 44, absent: 6, late: 3 },
]

const payrollData = [
  { name: "Processed", value: 120, fill: "#10b981" },
  { name: "Pending", value: 45, fill: "#f59e0b" },
  { name: "Rejected", value: 5, fill: "#ef4444" },
]

const employeeSparkline = [
  { value: 200 },
  { value: 210 },
  { value: 220 },
  { value: 230 },
  { value: 240 },
  { value: 248 },
]

const agentSparkline = [
  { value: 45 },
  { value: 47 },
  { value: 49 },
  { value: 50 },
  { value: 51 },
  { value: 52 },
]

const attendanceSparkline = [
  { value: 235 },
  { value: 238 },
  { value: 240 },
  { value: 241 },
  { value: 239 },
  { value: 242 },
]

const payoutSparkline = [
  { value: 1800 },
  { value: 1900 },
  { value: 2000 },
  { value: 2100 },
  { value: 2200 },
  { value: 2400 },
]

function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, track your attendance and payroll</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Status</h3>
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Status</p>
                <p className="text-2xl font-bold text-blue-600">Not Checked In</p>
              </div>
              <Link href="/dashboard/attendance">
                <Button className="w-full">Check In Now</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Monthly Attendance</h3>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">18</span>
                <span className="text-green-600 text-sm font-semibold">days</span>
              </div>
              <p className="text-sm text-muted-foreground">Present this month</p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[75%]"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Latest Payout</h3>
              <Banknote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">₹45,000</span>
              </div>
              <p className="text-sm text-muted-foreground">Last payout date</p>
              <Link href="/dashboard/payouts">
                <Button variant="outline" className="w-full mt-4">View Payroll</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Your Attendance Record (Last 7 Days)</h3>
            <p className="text-sm text-muted-foreground">Track your attendance pattern</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData.slice(0, 7)}>
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
              <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideUp" style={{ animationDelay: "0.4s" }}>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/dashboard/attendance">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  View Attendance Records
                </Button>
              </Link>
              <Link href="/dashboard/attendance/qr-display">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <p className="text-sm text-muted-foreground">Need help or have questions?</p>
            <Button variant="outline" className="w-full mt-4">Contact HR</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back to your HRMS system</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
        <StatCard
          title="Total Employees"
          value="248"
          change={12}
          changeLabel="+12 this month"
          icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          sparklineData={employeeSparkline}
          gradient="from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatCard
          title="Total Agents"
          value="52"
          change={6}
          changeLabel="+3 this month"
          icon={<Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
          sparklineData={agentSparkline}
          gradient="from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900"
        />
        <StatCard
          title="Today Present"
          value="242"
          change={98}
          changeLabel="98% attendance"
          icon={<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />}
          sparklineData={attendanceSparkline}
          gradient="from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatCard
          title="Payouts (₹)"
          value="2.4M"
          change={15}
          changeLabel="120 processed"
          icon={<Banknote className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          sparklineData={payoutSparkline}
          gradient="from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: "0.2s" }}>
        <Card className="p-6 lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Weekly Attendance</h3>
                <p className="text-sm text-muted-foreground">Employee attendance overview</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
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
                <Bar dataKey="present" fill="url(#colorPresent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="url(#colorAbsent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="url(#colorLate)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <div className="space-y-6 flex-1">
            <div>
              <h3 className="text-lg font-semibold">Payroll Status</h3>
              <p className="text-sm text-muted-foreground">Distribution overview</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={payrollData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {payrollData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp" style={{ animationDelay: "0.4s" }}>
        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Attendance Rate</h3>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">98%</span>
                <span className="text-green-600 text-sm font-semibold">↑ 2%</span>
              </div>
              <p className="text-sm text-muted-foreground">vs last week</p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[98%]"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Agents</h3>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">48</span>
                <span className="text-blue-600 text-sm font-semibold">↑ 3</span>
              </div>
              <p className="text-sm text-muted-foreground">of 52 total</p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full w-[92%]"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pending Payouts</h3>
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">45</span>
                <span className="text-yellow-600 text-sm font-semibold">↓ 5</span>
              </div>
              <p className="text-sm text-muted-foreground">to process</p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full w-[27%]"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      ) : user?.role === "EMPLOYEE" ? (
        <EmployeeDashboard />
      ) : (
        <AdminDashboard />
      )}
    </DashboardLayout>
  )
}
