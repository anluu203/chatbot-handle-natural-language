import { useState } from "react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface SendMessageResponse {
  success: boolean
  userMessage?: Message
  botMessage?: Message
  error?: string
}

interface GetMessagesResponse {
  success: boolean
  messages?: Array<{
    id: string
    text: string
    sender: "user" | "bot"
    timestamp: string
  }>
  total?: number
  error?: string
}

export function useMessage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Gửi tin nhắn
  const sendMessage = async (text: string, sessionId?: string): Promise<SendMessageResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể gửi tin nhắn")
      }

      // Chuyển đổi timestamp từ string sang Date
      if (data.userMessage) {
        data.userMessage.timestamp = new Date(data.userMessage.timestamp)
      }
      if (data.botMessage) {
        data.botMessage.timestamp = new Date(data.botMessage.timestamp)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy lịch sử chat
  const getMessages = async (sessionId?: string): Promise<Message[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const url = sessionId ? `/api/messages?sessionId=${sessionId}` : "/api/messages"
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: GetMessagesResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể lấy lịch sử chat")
      }

      // Chuyển đổi timestamp từ string sang Date
      const messages: Message[] =
        data.messages?.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })) || []

      return messages
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi"
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendMessage,
    getMessages,
    isLoading,
    error,
  }
}
