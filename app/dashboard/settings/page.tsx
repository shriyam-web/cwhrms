"use client"

import type React from "react"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, MapPin, Clock, RotateCcw } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slideUp">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Configure office and system settings</p>
        </div>

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
      </div>
    </DashboardLayout>
  )
}
