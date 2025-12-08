"use client"

import { Bell, Search, Sun, Moon, Menu, LayoutDashboard, Users, Briefcase, Clock, Wallet, Target, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/use-auth"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type NavItem = {
  label: string
  icon: React.ReactNode
  href: string
  roles: string[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "AGENT"],
  },
  {
    label: "Employees",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/employees",
    roles: ["ADMIN", "HR", "MANAGER"],
  },
  {
    label: "Agents",
    icon: <Briefcase className="h-5 w-5" />,
    href: "/dashboard/agents",
    roles: ["ADMIN", "HR", "MANAGER"],
  },
  {
    label: "Attendance",
    icon: <Clock className="h-5 w-5" />,
    href: "/dashboard/attendance",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
  },
  {
    label: "Payouts",
    icon: <Wallet className="h-5 w-5" />,
    href: "/dashboard/payouts",
    roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "AGENT"],
  },
  {
    label: "Targets",
    icon: <Target className="h-5 w-5" />,
    href: "/dashboard/targets",
    roles: ["ADMIN", "HR", "MANAGER", "AGENT"],
  },
  {
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/dashboard/settings",
    roles: ["ADMIN", "HR"],
  },
]

export function Topbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80">
      <div className="flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 gap-4 sm:gap-6">
        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-700 dark:border-slate-800">
            <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
              <div className="space-y-4 flex-1 py-6 px-3 sm:px-4">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex-shrink-0 overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <Image 
                      src="/logo.png" 
                      alt="CityWitty HRMS" 
                      width={44} 
                      height={44}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="block">
                    <span className="font-bold text-xs sm:text-sm text-white block">CityWitty</span>
                    <span className="text-xs text-blue-300 font-semibold">HRMS</span>
                  </div>
                </Link>
                <div className="space-y-2 pt-4">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-800/50 rounded-xl transition-all group"
                    >
                      <div className="text-slate-400 group-hover:text-blue-400 transition-colors">{item.icon}</div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-700 dark:border-slate-800 p-3 sm:p-4">
                <Button
                  onClick={handleLogout}
                  className="w-full justify-center gap-2 text-red-300 hover:text-white border-red-500/30 hover:border-red-400 bg-red-600/10 hover:bg-red-600/20 text-xs sm:text-sm h-11 sm:h-12 font-bold transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="inline">Logout</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center flex-1 gap-3 max-w-lg">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input 
            placeholder="Search attendance, payroll..." 
            className="text-sm bg-slate-100 dark:bg-slate-900 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
