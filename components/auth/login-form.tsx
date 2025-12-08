"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/use-auth"
import { AlertCircle, Lock, Mail, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [formError, setFormError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    try {
      await login(formData.email, formData.password)
      router.push("/dashboard")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your CityWitty HRMS account</p>
        </div>
      </div>

      {(formError || error) && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{formError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@citywittycommunity.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all" 
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
