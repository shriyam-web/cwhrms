"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/use-auth"

export function Topbar() {
  const { user } = useAuth()

  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        <div className="flex items-center flex-1 gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="max-w-sm" />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
