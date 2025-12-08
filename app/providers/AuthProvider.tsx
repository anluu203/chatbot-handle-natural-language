"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://103.216.116.118"

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  getAccessToken: () => string | null
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PUBLIC_PATHS = ["/login"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Kiểm tra auth khi khởi tạo
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getTokens()
      
      if (!tokens) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // Kiểm tra access token có hết hạn không
      if (isTokenExpired(tokens.access)) {
        // Thử refresh token
        const refreshed = await refreshAccessToken(tokens.refresh)
        if (!refreshed) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Redirect nếu chưa xác thực
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
        router.push("/login")
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/")
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Refresh access token
  const refreshAccessToken = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        removeTokens()
        return false
      }

      const data = await response.json()
      saveTokens({
        access: data.access,
        refresh: refreshToken,
      })

      return true
    } catch {
      removeTokens()
      return false
    }
  }

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
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || "Đăng nhập thất bại")
      }

      const data = await response.json()
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

  // Đăng xuất
  const logout = () => {
    removeTokens()
    setIsAuthenticated(false)
    router.push("/login")
  }

  // Lấy access token
  const getAccessToken = (): string | null => {
    const tokens = getTokens()
    return tokens?.access || null
  }

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        getAccessToken,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
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
    const exp = payload.exp * 1000
    return Date.now() >= exp
  } catch {
    return true
  }
}
