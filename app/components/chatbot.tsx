"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, Menu } from "lucide-react";

import { useMessage } from "../apis/useMessage";
import { useChatSession, ChatSession } from "../apis/useChatSession";
import { ChatSidebar } from "./chat-sidebar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [initialized, setInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("default-session");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { sendMessage, getMessages, isLoading, error } = useMessage();
  const { getSessions, createSession, deleteSession } = useChatSession();

  /** Auto Scroll */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /** Load messages for a session */
  const loadSessionMessages = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const history = await getMessages(sessionId);
    setMessages(history || []);
  };

  /** Initialize: load sessions + messages */
  useEffect(() => {
    if (!initialized) {
      const load = async () => {
        const sessionList = await getSessions();
        setSessions(sessionList || []);
        console.log(sessionList, 'sessionList');
        const history = await getMessages(currentSessionId);
        setMessages(history || []);
        setInitialized(true);
      };
      load();
    }
  }, [initialized, currentSessionId, getSessions, getMessages]);

  /** Send message */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput("");

    const response = await sendMessage(messageText, currentSessionId);

    if (response?.success && response.userMessage && response.botMessage) {
      setMessages((prev) => [...prev, response.userMessage, response.botMessage]);
    }

    const sessionList = await getSessions();
    setSessions(sessionList);
  };

  /** Create Session */
  const handleCreateSession = async () => {
    const newSession = await createSession();
    if (newSession) {
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      await loadSessionMessages(newSession.id);
    }
  };

  /** Delete Session */
  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);

    if (remaining.length > 0) {
      await loadSessionMessages(remaining[0].id);
    } else {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-chatbot-bg">

      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSessionMessages}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col">

        {/* Header */}
        <header className="border-b border-chatbot-border bg-white px-6 py-4 shadow-sm">
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
              <h1 className="text-xl font-bold text-foreground">AI Chatbot</h1>
              <p className="text-sm text-muted-foreground">
                <span className="h-2 w-2 inline-block rounded-full bg-green-500"></span> Trực tuyến
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-4">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-3xl px-5 py-3 sm:max-w-md lg:max-w-lg ${
                    msg.sender === "user"
                      ? "bg-chatbot-primary text-white shadow-md"
                      : "bg-chatbot-bot-bg text-foreground shadow-sm"
                  }`}
                >
                  <p className="text-sm sm:text-base">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
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
        <footer className="border-t border-chatbot-border bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-full border border-chatbot-border px-5 py-3 text-sm focus:ring-2 focus:ring-chatbot-primary/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-chatbot-primary text-white hover:bg-purple-600 disabled:opacity-50 sm:h-12 sm:w-12"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </footer>

      </div>
    </div>
  );
}
