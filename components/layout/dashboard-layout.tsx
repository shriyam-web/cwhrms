"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useAuth } from "@/lib/use-auth"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto scrollbar-hide">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-transparent dark:from-blue-900/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-transparent dark:from-indigo-900/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-b from-purple-200/20 to-transparent dark:from-purple-900/10 rounded-full blur-3xl opacity-20"></div>
          </div>
          <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
