"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize with welcome message
  useEffect(() => {
    if (!initialized) {
      const welcomeMessage: Message = {
        id: "0",
        text: "Xin chào! Tôi là AI Chatbot của bạn. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setInitialized(true);
    }
  }, [initialized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const responses: Record<string, string> = {
      "xin chào": "Xin chào! Có gì tôi có thể giúp bạn hôm nay?",
      "bạn là ai":
        "Tôi là một AI Chatbot được thiết kế để trò chuyện và giúp bạn với các câu hỏi của bạn.",
      "bạn có thể làm gì":
        "Tôi có thể trò chuyện với bạn, trả lời câu hỏi, giúp bạn với thông tin, và còn nhiều điều khác nữa!",
      "cảm ơn": "Không vấn đề gì! Hãy cho tôi biết nếu bạn cần thêm trợ giúp.",
    };

    const lowerInput = userInput.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        return value;
      }
    }

    return `Đó là một câu hỏi thú vị! Bạn có thể giải thích thêm về "${userInput}" được không?`;
  };

  return (
    <div className="flex h-screen flex-col bg-chatbot-bg">
      {/* Header */}
      <header className="border-b border-chatbot-border bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-chatbot-primary to-purple-600">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground">
              <button className="h-2 w-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></button> {" "}
              Trực tuyến
            </p>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-3xl px-5 py-3 sm:max-w-md lg:max-w-lg ${
                  message.sender === "user"
                    ? "bg-chatbot-primary text-white shadow-md"
                    : "bg-chatbot-bot-bg text-foreground shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed sm:text-base">
                  {message.text}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-3xl bg-chatbot-bot-bg px-5 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div className="animation-delay-400 h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-chatbot-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 rounded-full border border-chatbot-border bg-white px-5 py-3 text-sm focus:border-chatbot-primary focus:outline-none focus:ring-2 focus:ring-chatbot-primary/20"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-chatbot-primary text-white transition-all hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-chatbot-primary sm:h-12 sm:w-12"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
