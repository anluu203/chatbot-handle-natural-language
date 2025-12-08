import { NextRequest, NextResponse } from "next/server"

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

// In-memory storage (trong production nên dùng database)
export const chatSessions: Map<string, { session: ChatSession; messages: Message[] }> = new Map()

// Khởi tạo session mặc định
const defaultSessionId = "default-session"
chatSessions.set(defaultSessionId, {
  session: {
    id: defaultSessionId,
    title: "Chat mới",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 1,
  },
  messages: [
    {
      id: "0",
      text: "Xin chào! Tôi là AI Chatbot của bạn. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ],
})

// GET: Lấy danh sách tất cả các phiên chat
export async function GET() {
  try {
    const sessions: ChatSession[] = Array.from(chatSessions.values())
      .map((data) => data.session)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json(
      {
        success: true,
        sessions,
        total: sessions.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Không thể lấy danh sách phiên chat",
      },
      { status: 500 }
    )
  }
}

// POST: Tạo phiên chat mới
export async function POST() {
  try {
    const newSessionId = `session-${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Đoạn chat mới",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    }

    const welcomeMessage: Message = {
      id: "0",
      text: "Xin chào! Tôi là AI Chatbot của bạn. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!",
      sender: "bot",
      timestamp: new Date().toISOString(),
    }

    chatSessions.set(newSessionId, {
      session: newSession,
      messages: [welcomeMessage],
    })

    return NextResponse.json(
      {
        success: true,
        session: newSession,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo phiên chat mới",
      },
      { status: 500 }
    )
  }
}

// DELETE: Xóa phiên chat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu ID phiên chat",
        },
        { status: 400 }
      )
    }

    if (!chatSessions.has(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy phiên chat",
        },
        { status: 404 }
      )
    }

    chatSessions.delete(sessionId)

    return NextResponse.json(
      {
        success: true,
        message: "Đã xóa phiên chat",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Không thể xóa phiên chat",
      },
      { status: 500 }
    )
  }
}
