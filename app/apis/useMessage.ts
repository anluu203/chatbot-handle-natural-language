import { useState } from "react";
import { API_BASE_URL } from "../utils/const";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "./useAuth";
import { ChatSession } from "./useChatSession";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
  created_at?: string;
}

interface SendMessageResponse {
  question: string;
  answer: string;
  sources: any;
}

export function useMessage() {
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isLoadingGet, setIsLoadingGet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAccessToken } = useAuth();

  // Gửi tin nhắn
  const sendMessage = async (
    message: string,
    conversation_id: number,
    k: number
  ): Promise<SendMessageResponse | null> => {
    setIsLoadingSend(true);
    setError(null);

    try {
      const response = await apiClient(
        `${API_BASE_URL}/api/chat/chat/`,
        {
          method: "POST",
          body: JSON.stringify({ message, conversation_id, k }),
        },
        refreshAccessToken
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể gửi tin nhắn");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoadingSend(false);
    }
  };

  // Lấy lịch sử chat
  const getMessages = async (
    sessionId: number,
    options?: { silent?: boolean }
  ): Promise<ChatSession> => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoadingGet(true);
      setError(null);
    }

    try {
      const url = `${API_BASE_URL}/api/chat/conversations/${sessionId}/`;
      const response = await apiClient(
        url,
        { method: "GET" },
        refreshAccessToken
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể lấy lịch sử chat");
      }
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      if (!silent) setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      if (!silent) setIsLoadingGet(false);
    }
  };

  return {
    sendMessage,
    getMessages,
    isLoadingSend,
    isLoadingGet,
    error,
  };
}
