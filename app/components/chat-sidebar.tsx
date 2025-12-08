"use client"

import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { ChatSession } from "../apis/useChatSession"
interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  isOpen: boolean
  onToggle: () => void
}
export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Hôm nay"
    if (days === 1) return "Hôm qua"
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:sticky lg:z-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={onCreateSession}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-chatbot-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600"
          >
            <Plus className="h-4 w-4" />
            Chat mới
          </button>
        </div>

        {/* Sessions List */}
        <div className="overflow-y-auto" style={{ height: "calc(100vh - 73px)" }}>
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Chưa có lịch sử chat
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-start gap-3 rounded-lg p-3 transition-colors ${
                    currentSessionId === session.id
                      ? "bg-purple-50 text-chatbot-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="flex flex-1 items-start gap-3 overflow-hidden text-left"
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDate(session.updatedAt)} • {session.messageCount} tin nhắn
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSession(session.id)
                    }}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    title="Xóa chat"
                  >
                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
