"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Bot, Menu, LogOut } from "lucide-react";

import { Message, useMessage } from "../apis/useMessage";
import { useChatSession, ChatSession } from "../apis/useChatSession";
import { ChatSidebar } from "./chat-sidebar";
import { ChatInput } from "./chat-input";
import { useAuth } from "../apis/useAuth";

const MemoizedChatSidebar = memo(ChatSidebar);

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [initialized, setInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(1);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { sendMessage, getMessages, isLoadingSend, isLoadingGet, error } =
    useMessage();
  const { getSessions, createSession, deleteSession } = useChatSession();
  const { logout } = useAuth();

  /** Auto Scroll */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingGet]);

  /** Load messages for a session */
  const loadSessionMessages = useCallback(
    async (sessionId: number) => {
      setCurrentSessionId(sessionId);
      const history = await getMessages(sessionId);
      setMessages(history.messages || []);
    },
    [getMessages]
  );

  useEffect(() => {
    if (!initialized) {
      const load = async () => {
        const sessionList = await getSessions();
        setSessions(sessionList || []);
        const history = await getMessages(currentSessionId);
        setMessages(history.messages || []);
        setInitialized(true);
      };
      load();
    }
  }, [initialized, currentSessionId]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoadingSend) return;

      // Tạo tin nhắn user hiển thị ngay và placeholder assistant đang load
      const userMsgId = `u-${Date.now()}`;
      const assistantPlaceholderId = `a-${Date.now()}`;
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content: messageText,
      };
      const assistantPlaceholder: Message = {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "",
        loading: true,
      };

      // Hiển thị ngay
      setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);

      // Gọi API
      const response = await sendMessage(messageText, currentSessionId, 1);

      if (response) {
        // Thay placeholder bằng câu trả lời thực
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, content: response.answer, loading: false }
              : m
          )
        );
      } else {
        // Nếu lỗi, cập nhật placeholder hiển thị lỗi
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, content: "Đã có lỗi khi gửi tin nhắn", loading: false }
              : m
          )
        );
      }

      // Cập nhật danh sách session
      const sessionList = await getSessions();
      getMessages(currentSessionId, { silent: true });
      setSessions(sessionList);
    },
    [
      isLoadingSend,
      isLoadingGet,
      currentSessionId,
      sendMessage,
      getSessions,
      getMessages,
    ]
  );

  /** Create Session */
  const handleCreateSession = async (title_input: string) => {
    const newSession = await createSession({
      title: title_input,
      is_archived: true,
    });
    if (newSession) {
      // Refresh danh sách sessions từ server
      const sessionList = await getSessions();
      setSessions(sessionList || []);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      await loadSessionMessages(newSession.id);
    }
  };

  /** Delete Session */
  const handleDeleteSession = async (sessionId: number) => {
    await deleteSession(sessionId);

    // Refresh danh sách sessions từ server
    const sessionList = await getSessions();
    setSessions(sessionList || []);

    // Nếu đang ở session bị xóa, chuyển sang session khác
    if (currentSessionId === sessionId) {
      if (sessionList && sessionList.length > 0) {
        await loadSessionMessages(sessionList[0].id);
      } else {
        setMessages([]);
        setCurrentSessionId(1);
      }
    }
  };

  return (
    <div className="flex h-screen bg-chatbot-bg">
      {/* Sidebar */}
      <MemoizedChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSessionMessages}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col relative">
        {/* Header */}
        <header className="border-b border-chatbot-border bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle (mobile) */}
              <button
                className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chatbot-primary to-purple-600">
                <Bot className="h-6 w-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AI Chatbot
                </h1>
                <p className="text-sm text-muted-foreground">
                  <span className="h-2 w-2 inline-block rounded-full bg-green-500"></span>{" "}
                  Trực tuyến
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-4 ">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-3xl px-5 py-3 sm:max-w-md lg:max-w-lg ${
                    msg.role === "user"
                      ? "bg-chatbot-primary text-white shadow-md"
                      : msg.role === "assistant" && msg.content === ""
                      ? "hidden"
                      : "bg-chatbot-bot-bg text-foreground shadow-sm"
                  }`}
                >
                  <p className="text-sm sm:text-base">{msg?.content}</p>
                </div>
              </div>
            ))}

            {isLoadingSend && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-chatbot-bot-bg px-5 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-200"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground animation-delay-400"></div>
                  </div>
                </div>
              </div>
            )}
            {isLoadingGet && (
            <div className=" absolute top-1/2 left-1/2 transform">
              <div className="h-10 w-10 animate-spin rounded-full border-6 border-violet-600 border-t-transparent"></div>
            </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input */}
        <ChatInput onSubmit={handleSendMessage} isLoading={isLoadingSend} />
      </div>
    </div>
  );
}
