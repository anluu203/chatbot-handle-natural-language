"use client";

import { MessageSquare, Trash2, Plus } from "lucide-react";
import { ChatSession } from "../apis/useChatSession";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: number;
  onSelectSession: (sessionId: number) => void;
  onCreateSession: (title: string) => Promise<void>;
  onDeleteSession: (sessionId: number) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      await onCreateSession(title);
      setTitle("");
      setShowNewChatModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const onCloseCreateModal = (open: boolean) => {
    if (!open) setTitle("");
    setShowNewChatModal(open);
  };

  const handleDeleteSession = async () => {
    if (sessionToDelete !== null) {
      setIsDeleting(true);
      try {
        await onDeleteSession(sessionToDelete);
        setShowDeleteModal(false);
        setSessionToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openDeleteModal = (sessionId: number) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

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
          <Dialog.Root open={showNewChatModal} onOpenChange={onCloseCreateModal}>
            <Dialog.Trigger asChild>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-chatbot-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600">
                <Plus className="h-4 w-4" />
                Chat mới
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Tạo chat mới
                </Dialog.Title>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">
                    Tiêu đề đoạn chat
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chatbot-primary focus:ring-1 focus:ring-chatbot-primary"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => onCloseCreateModal(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={title.trim() === "" || isCreating}
                    onClick={handleCreateSession}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 bg-chatbot-primary disabled:opacity-50 disabled:hover:bg-chatbot-primary"
                  >
                    {isCreating ? "Đang tạo..." : "Tạo mới"}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Sessions List */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 73px)" }}
        >
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
                        {formatDate(session.created_at)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(session.id);
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

        {/* Delete Confirmation Modal */}
        <Dialog.Root open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Xóa cuộc trò chuyện
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa cuộc trò chuyện này không? Hành động này không thể hoàn tác.
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close asChild>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                    Hủy
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDeleteSession}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </aside>
    </>
  );
}
