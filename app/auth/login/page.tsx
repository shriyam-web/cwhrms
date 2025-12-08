"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Shield, Users, BarChart3, Lock } from "lucide-react"

export default function LoginPage() {
  const roles = [
    {
      name: "Employee",
      role: "EMPLOYEE",
      color: "from-blue-500 to-blue-600",
      description: "Access your attendance, payroll, and performance metrics",
      icon: Users,
    },
    {
      name: "HR Manager",
      role: "HR",
      color: "from-purple-500 to-purple-600",
      description: "Manage employees, approvals, and HR operations",
      icon: BarChart3,
    },
    {
      name: "Admin",
      role: "ADMIN",
      color: "from-red-500 to-red-600",
      description: "Full system access and configuration control",
      icon: Shield,
    },
    {
      name: "Agent",
      role: "AGENT",
      color: "from-green-500 to-green-600",
      description: "Track commissions and manage agent operations",
      icon: Lock,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animation: 'blob 7s infinite' }}></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animation: 'blob 7s infinite 2s' }}></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-200">Role-Based Access Control</span>
              </div>
              <h2 className="text-5xl font-bold text-white leading-tight">
                Secure Access for Every Role
              </h2>
              <p className="text-lg text-blue-100">
                CityWitty HRMS uses advanced role-based access control to ensure each team member has the right permissions for their responsibilities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon
                return (
                  <div
                    key={role.role}
                    className="group relative bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{role.name}</h3>
                    <p className="text-sm text-blue-100">{role.description}</p>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                )
              })}
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Enterprise-Grade Security</h4>
                  <p className="text-blue-100">Your data is protected with encryption and granular access controls</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  )
}
