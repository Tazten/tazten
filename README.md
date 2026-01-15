# 无感记账 - 账单识别系统

AI 智能识别账单，自动记录每一笔消费。

开发者：Tazten

> 本系统仅用于第二次作业展示，后续产品开发将使用 iPhone 快捷指令对接。Web 上传功能仅为更好地展示作业要求。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **对象存储**: 火山引擎 TOS
- **AI 识别**: 火山引擎豆包视觉理解

## 功能特性

- 📤 上传账单图片（单张）
- 🤖 AI 自动识别账单信息
- 💾 自动入库到 Supabase
- 📊 历史记录查看
- 📄 详情页展示（含完整 JSON）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入你的配置：

```bash
cp .env.example .env.local
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
tazten/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 首页
│   ├── api/              # API 路由
│   └── transactions/     # 交易相关页面
├── lib/                   # 工具函数
│   ├── supabase/         # Supabase 客户端
│   ├── tos/              # TOS 上传工具
│   └── doubao/           # 豆包 API
├── components/            # React 组件
└── types.ts              # TypeScript 类型
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

## 开发计划

- [x] 前端 UI 设计
- [ ] Supabase 数据库配置
- [ ] TOS 图片上传
- [ ] 豆包视觉理解 API 对接
- [ ] 完整流程测试

