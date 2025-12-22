export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://103.216.116.118"



export const MOCK_MESSAGES = [
    {
      id: 1,
      role: "user",
      content: "Tôi ly hôn thì mất bao nhiêu tiền?",
      meta: null,
      created_at: "2025-12-10T10:30:00Z"
    },
    {
      id: 2,
      role: "assistant",
      content: "... câu trả lời dài ...",
      meta: {
        sources: [
          {
            content: "Điều 68. Tuyên bố mất tích…",
            metadata: {
              source: "/app/core/data/BLDS.docx"
            }
          }
        ]
      },
      created_at: "2025-12-10T10:30:05Z"
    }
  ]