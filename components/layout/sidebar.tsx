"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/use-auth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Users, Briefcase, Clock, Wallet, Target, Settings, LogOut, Menu } from "lucide-react"
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
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="space-y-4 flex-1 py-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            HR
          </div>
          <span className="font-bold hidden md:inline">HRMS</span>
        </Link>

        <nav className="space-y-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-2 border-t p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-sm flex-1">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
            {user?.profile && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">{user.profile.type}</span>
                {user.profile.verified && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-1.5 py-0.5 rounded">
                    Verified
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
          className="w-full justify-start gap-2 bg-transparent"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex w-56 border-r bg-card flex-col", className)}>
        <NavContent />
      </div>
    </>
  )
}
