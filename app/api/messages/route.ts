import { NextRequest, NextResponse } from "next/server"
import { chatSessions } from "../chat-sessions/route"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

// GET: Lấy tin nhắn của một phiên chat
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default-session"

    const sessionData = chatSessions.get(sessionId)
    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy phiên chat",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        messages: sessionData.messages,
        total: sessionData.messages.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Không thể lấy lịch sử chat",
      },
      { status: 500 }
    )
  }
}

// POST: Gửi tin nhắn mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sessionId = "default-session" } = body

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Tin nhắn không hợp lệ",
        },
        { status: 400 }
      )
    }

    const sessionData = chatSessions.get(sessionId)
    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: "Không tìm thấy phiên chat",
        },
        { status: 404 }
      )
    }

    // Tạo tin nhắn của user
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    sessionData.messages.push(userMessage)

    // Tạo phản hồi từ bot
    const botResponse = generateBotResponse(text)
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date().toISOString(),
    }

    sessionData.messages.push(botMessage)

    // Cập nhật thông tin session
    sessionData.session.updatedAt = new Date().toISOString()
    sessionData.session.messageCount = sessionData.messages.length

    // Cập nhật title nếu đây là tin nhắn đầu tiên của user
    if (sessionData.session.messageCount === 3) {
      // 1 welcome + 1 user + 1 bot
      sessionData.session.title = text.trim().substring(0, 30) + (text.length > 30 ? "..." : "")
    }

    return NextResponse.json(
      {
        success: true,
        userMessage,
        botMessage,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Không thể gửi tin nhắn",
      },
      { status: 500 }
    )
  }
}

// Hàm tạo phản hồi của bot
function generateBotResponse(userInput: string): string {
  const responses: Record<string, string> = {
    "xin chào": "Xin chào! Có gì tôi có thể giúp bạn hôm nay?",
    "hello": "Xin chào! Có gì tôi có thể giúp bạn hôm nay?",
    "bạn là ai": "Tôi là một AI Chatbot được thiết kế để trò chuyện và giúp bạn với các câu hỏi của bạn.",
    "bạn có thể làm gì":
      "Tôi có thể trò chuyện với bạn, trả lời câu hỏi, giúp bạn với thông tin, và còn nhiều điều khác nữa!",
    "cảm ơn": "Không vấn đề gì! Hãy cho tôi biết nếu bạn cần thêm trợ giúp.",
    "thank you": "Không vấn đề gì! Hãy cho tôi biết nếu bạn cần thêm trợ giúp.",
    "tạm biệt": "Tạm biệt! Hẹn gặp lại bạn sau!",
    "bye": "Tạm biệt! Hẹn gặp lại bạn sau!",
  }

  const lowerInput = userInput.toLowerCase()
  for (const [key, value] of Object.entries(responses)) {
    if (lowerInput.includes(key)) {
      return value
    }
  }

  return `Đó là một câu hỏi thú vị! Bạn có thể giải thích thêm về "${userInput}" được không?`
}
