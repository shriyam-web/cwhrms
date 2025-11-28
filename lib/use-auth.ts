"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "./api-client"

export interface UserProfile {
  type: string
  verified: boolean
  createdAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  isActive?: boolean
  lastLogin?: Date
  profile?: UserProfile
  profilePicture?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get<User>("/api/auth/me")
      setUser(response.user as User)
      setError(null)
    } catch (err) {
      setUser(null)
      setError(err instanceof Error ? err.message : "Auth check failed")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<User>("/api/auth/login", {
        email,
        password,
      })
      if (response.token) {
        apiClient.setToken(response.token)
      }
      setUser(response.user as User)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (email: string, password: string, name: string, role = "EMPLOYEE", birthDate?: string, cityCode?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<User>("/api/auth/signup", {
        email,
        password,
        name,
        role,
        birthDate,
        cityCode,
      })
      if (response.token) {
        apiClient.setToken(response.token)
      }
      setUser(response.user as User)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    apiClient.clearToken()
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  }
}
