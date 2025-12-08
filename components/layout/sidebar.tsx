"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/use-auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Briefcase, Clock, Wallet, Target, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
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

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  const NavContent = () => (
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

        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm md:text-base text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-indigo-600/30 transition-all duration-200 group relative overflow-hidden"
            >
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-indigo-600 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-200"></span>
              <span className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform group-hover:text-blue-300">{item.icon}</span>
              <span className="inline font-semibold group-hover:font-bold transition-all truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4 border-t border-slate-700 dark:border-slate-800 p-4 sm:p-5 bg-gradient-to-t from-slate-900 via-slate-800 to-transparent dark:from-slate-950 dark:via-slate-900 dark:to-transparent">
        <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 dark:border-blue-500/20">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 block">
            <p className="font-bold truncate text-xs sm:text-sm text-white">{user?.name}</p>
            <p className="text-xs text-blue-300 truncate font-semibold">{user?.role}</p>
            {user?.profile && (
              <div className="flex items-center gap-2 mt-2">
                {user.profile.verified && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-bold border border-green-500/40">
                    ✓ Verified
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center gap-2 text-red-300 hover:text-white border-red-500/30 hover:border-red-400 bg-red-600/10 hover:bg-red-600/20 text-xs sm:text-sm h-11 sm:h-12 font-bold transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="inline">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className={cn("hidden md:flex w-56 border-r border-slate-700 dark:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex-col shadow-lg", className)}>
      <NavContent />
    </div>
  )
}
