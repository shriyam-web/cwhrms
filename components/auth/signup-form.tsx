"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/use-auth"
import { AlertCircle } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const { signup, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthDate: "",
    cityCode: "",
    role: "EMPLOYEE",
  })
  const [formError, setFormError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return
    }

    if (!formData.birthDate) {
      setFormError("Date of birth is required")
      return
    }

    if (!formData.cityCode || formData.cityCode.length < 1) {
      setFormError("City code is required")
      return
    }

    try {
      await signup(formData.email, formData.password, formData.name, formData.role, formData.birthDate, formData.cityCode)
      router.push("/dashboard")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Signup failed")
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-balance">Create Account</h1>
        <p className="text-muted-foreground">Join our HRMS platform</p>
      </div>

      {(formError || error) && (
        <div className="flex gap-2 rounded-lg bg-red-50 p-4 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{formError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-muted-foreground">At least 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date of Birth</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cityCode">City Code (3 letters)</Label>
          <Input
            id="cityCode"
            name="cityCode"
            type="text"
            placeholder="e.g., NYC, LAX, BNG"
            value={formData.cityCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, cityCode: e.target.value.slice(0, 3) }))}
            maxLength={3}
            required
          />
          <p className="text-xs text-muted-foreground">Will generate ID like: CW/NYC-0727</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="AGENT">Agent</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
