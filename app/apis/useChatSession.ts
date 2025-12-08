import { useState } from "react"
import { API_BASE_URL } from "../utils/const"
import { useAuth } from "./useAuth"

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface GetSessionsResponse {
  success: boolean
  sessions?: ChatSession[]
  total?: number
  error?: string
}

interface CreateSessionResponse {
  success: boolean
  session?: ChatSession
  error?: string
}

interface DeleteSessionResponse {
  success: boolean
  message?: string
  error?: string
}

export function useChatSession() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getAccessToken } = useAuth();
  const accessToken = getAccessToken();
  // Lấy danh sách phiên chat
  const getSessions = async (): Promise<ChatSession[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`,
        },
      })

      const data: GetSessionsResponse = await response.json()
      console.log(data, 'data in api');
      
      if (!response.ok) {
        throw new Error(data.error || "Không thể lấy danh sách phiên chat")
      }

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Tạo phiên chat mới
  const createSession = async (): Promise<ChatSession | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: CreateSessionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo phiên chat mới")
      }

      return data.session || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa phiên chat
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat-sessions?sessionId=${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: DeleteSessionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể xóa phiên chat")
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getSessions,
    createSession,
    deleteSession,
    isLoading,
    error,
  }
}
