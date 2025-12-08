"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, MapPin, Clock, RotateCcw, Lock, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/use-auth"
import { apiClient } from "@/lib/api-client"

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    officeName: "Main Office",
    location: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.209,
    attendanceRadius: 100,
    shiftStartTime: "09:00",
    shiftEndTime: "18:00",
    qrRotationInterval: 30,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPasswordError(null)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setPasswordLoading(true)
    try {
      await apiClient.post("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })

      setPasswordSuccess("Password changed successfully!")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        setPasswordSuccess(null)
      }, 3000)
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change password"
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Configure your account and system settings</p>
        </div>

        {/* Password Reset Section */}
        <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold">Change Password</h2>
            </div>

            {passwordError && (
              <div className="flex gap-3 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-700 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex gap-3 rounded-lg bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-700 p-4">
                <div className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5">✓</div>
                <p className="text-sm text-green-700 dark:text-green-300">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="transition-all duration-200"
                  required
                />
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Password requirements: Minimum 8 characters. Use a mix of uppercase, lowercase, numbers, and special characters for better security.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-red-600 hover:bg-red-700"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>

        {/* System Settings - Only for HR/ADMIN */}
        {user && (user.role === "HR" || user.role === "ADMIN") && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Office Settings */}
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">Office Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="officeName" className="text-sm font-medium">Office Name</Label>
                  <Input
                    id="officeName"
                    name="officeName"
                    value={settings.officeName}
                    onChange={handleChange}
                    className="transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={settings.location}
                    onChange={handleChange}
                    className="transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.0001"
                      value={settings.latitude}
                      onChange={handleChange}
                      className="transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.0001"
                      value={settings.longitude}
                      onChange={handleChange}
                      className="transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Attendance Settings */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold">Attendance Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceRadius" className="text-sm font-medium">Attendance Radius (meters)</Label>
                  <Input
                    id="attendanceRadius"
                    name="attendanceRadius"
                    type="number"
                    value={settings.attendanceRadius}
                    onChange={handleChange}
                    className="transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="shiftStartTime" className="text-sm font-medium">Start Time</Label>
                    <Input
                      id="shiftStartTime"
                      name="shiftStartTime"
                      type="time"
                      value={settings.shiftStartTime}
                      onChange={handleChange}
                      className="transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shiftEndTime" className="text-sm font-medium">End Time</Label>
                    <Input
                      id="shiftEndTime"
                      name="shiftEndTime"
                      type="time"
                      value={settings.shiftEndTime}
                      onChange={handleChange}
                      className="transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* QR Code Settings */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-1">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold">QR Code Settings</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrRotationInterval" className="text-sm font-medium">Rotation Interval (seconds)</Label>
                  <Input
                    id="qrRotationInterval"
                    name="qrRotationInterval"
                    type="number"
                    value={settings.qrRotationInterval}
                    onChange={handleChange}
                    className="transition-all duration-200"
                  />
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    QR codes will be updated every {settings.qrRotationInterval} seconds for enhanced security.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

            <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Save Changes</h3>
                  <p className="text-sm text-muted-foreground mt-1">All your settings will be updated immediately</p>
                </div>
                <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
