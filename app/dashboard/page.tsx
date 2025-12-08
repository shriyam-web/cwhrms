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
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            📊
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-slate-200 dark:to-slate-50 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Track your attendance and payroll in real-time</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Today's Status</h3>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Check-in Status</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">Not Checked In</p>
              </div>
              <Link href="/dashboard/attendance" className="block">
                <Button className="w-full text-sm sm:text-base h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                  Check In Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Monthly Attendance</h3>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">18</span>
                <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">days</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Present this month</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[75%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-950/5 group hover:scale-105 transform sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Latest Payout</h3>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <Banknote className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">₹45,000</span>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Last payout date</p>
              <Link href="/dashboard/payouts" className="block">
                <Button variant="outline" className="w-full text-sm sm:text-base h-10 sm:h-11 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all">
                  View Payroll
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Your Attendance Record</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Track your attendance pattern over the last 7 days</p>
            </div>
            <Link href="/dashboard/my-attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
              View All →
            </Link>
          </div>
          <div className="w-full h-72 sm:h-96 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData.slice(0, 7)}>
                <defs>
                  <linearGradient id="employeePresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 13, fontWeight: 500 }} />
                <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 13 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="present" fill="url(#employeePresent)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-50/50 dark:from-indigo-950/20 dark:to-indigo-950/5 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-200/30 rounded-full -mr-20 -mb-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Quick Actions</h3>
              <div className="p-3 bg-indigo-500 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/dashboard/attendance" className="block">
                <Button className="w-full justify-between text-sm sm:text-base h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all group/btn">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    View Attendance
                  </span>
                  <span className="text-xs">→</span>
                </Button>
              </Link>
              <Link href="/dashboard/attendance/qr-display" className="block">
                <Button className="w-full justify-between text-sm sm:text-base h-11 sm:h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all group/btn">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    View QR Code
                  </span>
                  <span className="text-xs">→</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-cyan-50 to-cyan-50/50 dark:from-cyan-950/20 dark:to-cyan-950/5 group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-200/30 rounded-full -mr-20 -mb-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold">Need Help?</h3>
              <div className="p-3 bg-cyan-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Have questions or need support? Reach out to our HR team anytime.</p>
            <Button className="w-full text-sm sm:text-base h-11 sm:h-12 bg-cyan-600 hover:bg-cyan-700 shadow-lg hover:shadow-xl transition-all">
              Contact HR Team
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            👨‍💼
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-50 dark:via-slate-200 dark:to-slate-50 bg-clip-text text-transparent">
              HRMS Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your workforce and view comprehensive analytics at a glance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Employees"
          value="248"
          change={12}
          changeLabel="+12 this month"
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />}
          sparklineData={employeeSparkline}
          gradient="from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatCard
          title="Total Agents"
          value="52"
          change={6}
          changeLabel="+3 this month"
          icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />}
          sparklineData={agentSparkline}
          gradient="from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900"
        />
        <StatCard
          title="Today Present"
          value="242"
          change={98}
          changeLabel="98% attendance"
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />}
          sparklineData={attendanceSparkline}
          gradient="from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatCard
          title="Payouts (₹)"
          value="2.4M"
          change={15}
          changeLabel="120 processed"
          icon={<Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />}
          sparklineData={payoutSparkline}
          gradient="from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-8 lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Weekly Attendance</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Comprehensive employee attendance overview</p>
              </div>
              <Link href="/dashboard/attendance" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                View More →
              </Link>
            </div>
            <div className="w-full h-80 sm:h-96 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 13, fontWeight: 500 }} />
                  <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "13px", fontWeight: 500 }} />
                  <Bar dataKey="present" fill="url(#colorPresent)" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="absent" fill="url(#colorAbsent)" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="late" fill="url(#colorLate)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-950/20 dark:to-slate-950/5 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">Payroll Status</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Distribution overview</p>
              </div>
              <Link href="/dashboard/payouts" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline">
                View →
              </Link>
            </div>
            <div className="w-full h-72 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payrollData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
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
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/20 dark:to-green-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Attendance Rate</h3>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">98%</span>
                <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">↑ 2%</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">vs last week</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full w-[98%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/5 group hover:scale-105 transform">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Active Agents</h3>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">48</span>
                <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">↑ 3</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">of 52 total</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full w-[92%] rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-yellow-50/50 dark:from-yellow-950/20 dark:to-yellow-950/5 group hover:scale-105 transform sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-200/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-muted-foreground">Pending Payouts</h3>
              <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                <Banknote className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-4xl sm:text-5xl font-bold text-yellow-600 dark:text-yellow-400">45</span>
                <span className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm font-bold bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">↓ 5</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">to process</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full w-[27%] rounded-full shadow-lg"></div>
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
