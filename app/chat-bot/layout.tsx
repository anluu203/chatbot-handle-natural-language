"use client";

import React, {  useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getTokens } from "../utils/tokens";




const PUBLIC_PATHS = ["/login"];

export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();



  // Kiểm tra auth khi khởi tạo
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getTokens();

      if (!tokens) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, isLoading, pathname]);

  // Redirect nếu chưa xác thực
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/chat-bot");
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
