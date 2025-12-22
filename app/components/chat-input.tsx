"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

interface ChatFormInputs {
  message: string;
}

export const ChatInput = React.memo(function ChatInput({
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const { register, handleSubmit, reset } = useForm<ChatFormInputs>({
    defaultValues: { message: "" },
  });

  const onFormSubmit = async (data: ChatFormInputs) => {
    if (!data.message.trim()) return;
    onSubmit(data.message);
    reset();
  };

  return (
    <footer className="border-t border-chatbot-border bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex gap-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-chatbot-border px-5 py-3 text-sm focus:ring-2 focus:ring-chatbot-primary/20"
            {...register("message")}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-chatbot-primary text-white hover:bg-purple-600 disabled:opacity-50 sm:h-12 sm:w-12"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </footer>
  );
});
