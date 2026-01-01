import { useState } from "react";
import { API_BASE_URL } from "../utils/const";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "./useAuth";
import { Message } from "./useMessage";

export interface ChatSession {
  id: number;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  messages: Message[];
  last_message: string;
}

interface DeleteSessionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function useChatSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAccessToken } = useAuth();

  // Lấy danh sách phiên chat
  const getSessions = async (): Promise<ChatSession[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(
        `${API_BASE_URL}/api/chat/conversations/`,
        { method: "GET" },
        refreshAccessToken
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể lấy danh sách phiên chat");
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo phiên chat mới
  const createSession = async ({
    title,
    is_archived,
  }: {
    title: string;
    is_archived: boolean;
  }): Promise<ChatSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(
        `${API_BASE_URL}/api/chat/conversations/`,
        {
          method: "POST",
          body: JSON.stringify({ title, is_archived }),
        },
        refreshAccessToken
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo phiên chat mới");
      }

      return data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa phiên chat
  const deleteSession = async (sessionId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(
        `${API_BASE_URL}/api/chat/conversations/${sessionId}`,
        { method: "DELETE" },
        refreshAccessToken
      );

      const data: DeleteSessionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể xóa phiên chat");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getSessions,
    createSession,
    deleteSession,
    isLoading,
    error,
  };
}
