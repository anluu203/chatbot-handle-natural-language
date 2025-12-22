# Chat Bot Application

Ứng dụng Chat Bot được xây dựng với [Next.js](https://nextjs.org) và React. 

## Yêu cầu hệ thống

- Node.js 18+ hoặc Docker
- npm hoặc yarn

## Hướng dẫn chạy ứng dụng

### 1. Chạy với npm (Nếu đã cài Nodejs trên máy)

#### Cài đặt dependencies:
```bash
npm install
```

#### Chạy ứng dụng ở chế độ development:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

#### Build ứng dụng:
```bash
npm run build
```

#### Chạy ứng dụng ở chế độ production:
```bash
npm run build
npm start
```

### 2. Chạy với Docker

#### Build Docker image:
```bash
docker build -t chat-bot:latest .
```

#### Chạy container:
```bash
docker run -p 3000:3000 chat-bot:latest
```

#### Chạy container với tên custom:
```bash
docker run -p 3000:3000 --name my-chat-bot chat-bot:latest
```
Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

#### Dừng container:
```bash
docker stop my-chat-bot
```

#### Xoá container:
```bash
docker rm my-chat-bot
```

### 3. Chạy với Docker Compose (tuỳ chọn)

Tạo file `docker-compose.yml` nếu cần:

```yaml
version: '3.8'

services:
  chat-bot:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

Sau đó chạy:
```bash
docker-compose up
```

## Cấu trúc dự án

```
.
├── app/
│   ├── api/              # API routes
│   ├── apis/             # API client hooks
│   ├── chat-bot/         # Chat bot page
│   ├── components/       # React components
│   ├── login/            # Login page
│   ├── utils/            # Utility functions
│   └── page.tsx          # Home page
├── public/               # Static files
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Project dependencies
```

## NPM Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build ứng dụng cho production
- `npm start` - Chạy ứng dụng ở chế độ production
- `npm run lint` - Chạy ESLint để kiểm tra code

## Công nghệ sử dụng

- **Framework**: Next.js 16.0.1
- **Language**: TypeScript
- **UI**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Mở rộng

Để chỉnh sửa ứng dụng:

1. Tệp page chính: `app/page.tsx`
2. Components: `app/components/`
3. API routes: `app/api/`
4. Styles: `app/globals.css` (Tailwind CSS)


## Tìm hiểu thêm

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## Liên hệ & Hỗ trợ

Nếu có vấn đề gì, vui lòng kiểm tra:
1. Đã cài đặt dependencies: `npm install`
2. Port 3000 có bị chiếm không
3. Phiên bản Node.js: `node --version` (phải >= 18)
