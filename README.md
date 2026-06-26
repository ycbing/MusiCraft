# 🎵 MusiCraft — AI 音乐创作平台

> 用 AI 秒级创作原创歌曲。写歌词、选风格、生成音乐，无需任何乐器基础。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black?style=flat)](https://ui.shadcn.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat&logo=postgresql)](https://postgresql.org)
[![MiniMax](https://img.shields.io/badge/MiniMax-music--2.6-purple?style=flat)](https://platform.minimaxi.com)

---

## ✨ 功能

- **🤖 AI 歌词生成** — 输入主题，GLM 大模型自动生成专业歌词
- **🎸 13 种音乐风格** — 流行、摇滚、说唱、电子、古典、爵士、民谣…
- **🎭 11 种情绪选择** — 欢快、忧伤、动感、平静、浪漫、黑暗、梦幻…
- **🎵 MiniMax 音乐生成** — 免费/付费模型可选，最高支持 58 秒生成
- **🎚️ Web Audio 频谱播放器** — 实时波形可视化，自由拖拽进度
- **🎨 智能封面生成** — 根据风格+情绪自动生成 SVG 抽象封面
- **📦 COS 云存储** — 腾讯云 COS 存储音频，签名 URL 安全访问
- **📥 下载/分享/重新生成** — 完整作品管理功能
- **💳 积分系统** — 注册送积分，每次生成扣 5 分
- **🌙 暗色主题** — 紫蓝渐变品牌视觉 + 玻璃态毛玻璃效果

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | Next.js 16 (App Router) |
| **样式** | Tailwind CSS v4 + shadcn/ui |
| **数据库** | PostgreSQL 16 + Drizzle ORM |
| **认证** | NextAuth.js (Auth.js v5) + JWT |
| **AI 音乐** | MiniMax API (music-2.6) |
| **AI 歌词** | GLM-4 Flash (DeepSeek) |
| **存储** | 腾讯云 COS (S3-compatible) |
| **部署** | PM2 + 腾讯云轻量服务器 |

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 16
- npm / pnpm

### 安装

```bash
git clone https://github.com/ycbing/MusiCraft.git
cd MusiCraft
npm install
```

### 环境变量

创建 `.env.local`：

```env
# 数据库
DATABASE_URL=postgres://user:password@localhost:5432/musicraft

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3006

# 腾讯云 COS
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket
COS_REGION=ap-shanghai

# AI 歌词 (GLM/DeepSeek)
GLM_API_KEY=your-api-key
GLM_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat

# MiniMax 音乐生成
MINIMAX_API_KEY=your-minimax-key
MUSIC_MODEL=music-2.6          # paid: music-2.6, free: music-2.6-free

# 端口
PORT=3006
```

### 开发

```bash
npm run dev
# 或
npm run build && npm start
```

### 数据库初始化

```bash
# 创建数据库
createdb musicraft

# 运行 schema
psql -d musicraft -f scripts/schema.sql
```

## 🏗️ 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth + 注册
│   │   ├── cos/            # COS 存储代理
│   │   └── generate/       # 歌词生成 + 音乐生成
│   │   └── songs/          # 歌曲 CRUD
│   ├── create/             # 创作页面 (3步流程)
│   ├── dashboard/          # 作品管理 Dashboard
│   ├── login/              # 登录
│   ├── register/           # 注册
│   └── song/[id]/          # 歌曲详情 & 播放器
├── components/
│   ├── AlbumCover.tsx      # SVG 智能封面生成
│   ├── NavBar.tsx          # 导航栏
│   ├── StatsCards.tsx      # 统计卡片
│   ├── WaveformPlayer.tsx  # Web Audio 频谱播放器
│   └── ui/                 # shadcn/ui 组件
├── lib/
│   ├── ai/                 # AI 调用封装 (GLM + MiniMax)
│   ├── auth.ts             # 服务端认证工具
│   └── cos.ts              # COS 上传/签名
├── db/                     # 数据库 schema + 连接
└── types/                  # TypeScript 类型定义
```

## 🔧 API 概览

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册新用户 |
| `/api/songs` | GET/POST | 获取/创建歌曲 |
| `/api/songs/[id]` | GET/PUT/DELETE | 歌曲详情/更新/删除 |
| `/api/generate/lyrics` | POST | AI 生成歌词 |
| `/api/generate/music` | POST | MiniMax 音乐生成 |
| `/api/cos/[...path]` | GET | COS 音频文件代理 |

## 📸 页面

- **Landing** (`/`) — 品牌首页 + 功能展示
- **Dashboard** (`/dashboard`) — 作品墙、统计、搜索筛选
- **Create** (`/create`) — 三步创作（主题→歌词→生成）
- **Song Detail** (`/song/[id]`) — 播放器 + 封面 + 操作
- **Login** (`/login`) — 登录
- **Register** (`/register`) — 注册

## 📄 License

MIT
