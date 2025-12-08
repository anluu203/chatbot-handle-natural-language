"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "../utils/const"


interface AuthTokens {
  access: string
  refresh: string
}

interface LoginResponse {
  access: string
  refresh: string
}

interface RefreshResponse {
  access: string
}

interface AuthError {
  detail?: string
  message?: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Kiểm tra token khi khởi tạo
  useEffect(() => {
    checkAuth()
  }, [])

  // Kiểm tra xác thực
  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    
    const tokens = getTokens()
    if (!tokens) {
      setIsAuthenticated(false)
      setIsLoading(false)
      return false
    }

    // Kiểm tra access token có hết hạn không
    if (isTokenExpired(tokens.access)) {
      // Thử refresh token
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return false
      }
    }

    setIsAuthenticated(true)
    setIsLoading(false)
    return true
  }, [])

  // Đăng nhập
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData: AuthError = await response.json()
        throw new Error(errorData.detail || errorData.message || "Đăng nhập thất bại")
      }

      const data: LoginResponse = await response.json()
      
      // Lưu tokens
      saveTokens({
        access: data.access,
        refresh: data.refresh,
      })

      setIsAuthenticated(true)
      setIsLoading(false)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      setIsAuthenticated(false)
      setIsLoading(false)
      return false
    }
  }

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    const tokens = getTokens()
    if (!tokens?.refresh) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: tokens.refresh }),
      })

      if (!response.ok) {
        // Refresh token hết hạn, xóa tokens
        removeTokens()
        return false
      }

      const data: RefreshResponse = await response.json()
      
      // Cập nhật access token mới
      saveTokens({
        access: data.access,
        refresh: tokens.refresh,
      })

      return true
    } catch (err) {
      removeTokens()
      return false
    }
  }

  // Đăng xuất
  const logout = useCallback(() => {
    removeTokens()
    setIsAuthenticated(false)
    router.push("/login")
  }, [router])

  // Lấy access token hiện tại
  const getAccessToken = (): string | null => {
    const tokens = getTokens()
    return tokens?.access || null
  }

  // Chuyển hướng đến login nếu chưa xác thực
  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    refreshAccessToken,
    getAccessToken,
    requireAuth,
    getTokens,
  }
}

// Utility functions
function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null
  
  const access = localStorage.getItem("access_token")
  const refresh = localStorage.getItem("refresh_token")
  
  if (!access || !refresh) return null
  
  return { access, refresh }
}

function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return
  
  localStorage.setItem("access_token", tokens.access)
  localStorage.setItem("refresh_token", tokens.refresh)
}

function removeTokens(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true
  }
}
