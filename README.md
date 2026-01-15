# 📱 无感记账

AI 智能识别账单，自动记录每一笔消费

## ✨ 项目简介

无感记账是一个基于 AI 视觉理解的智能账单识别系统，通过上传账单图片，自动识别并结构化记录每一笔消费和收入。

**开发者**: Tazten  
**项目用途**: 第二次作业展示  
**后续计划**: 将使用 iPhone 快捷指令对接，Web 上传功能仅为更好地展示作业要求。

## 🚀 核心功能

- 📤 **图片上传**: 支持拖拽或点击上传账单图片（JPG、PNG 格式）
- 🤖 **AI 识别**: 使用豆包视觉理解 API（Doubao-Seed-1.6-Flash）自动识别账单信息
- 📊 **结构化数据**: 自动提取金额、商户、分类、时间等关键信息
- 💾 **数据存储**: 使用 Supabase 存储图片和交易记录
- 📋 **历史记录**: 查看所有交易记录，支持按类型筛选（支出/收入）
- 🔍 **详情查看**: 查看单条记录的完整信息，包括原始图片、识别文本和 JSON 数据

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: React 18
- **数据库**: Supabase (PostgreSQL)
- **存储**: Supabase Storage
- **AI 服务**: 火山引擎豆包视觉理解 API
- **部署**: Vercel

## 📦 项目结构

```
tazten/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（上传/历史切换）
│   ├── transactions/
│   │   └── [id]/
│   │       └── page.tsx         # 交易详情页
│   └── api/
│       └── parse-and-save/
│           └── route.ts         # API 路由：解析并保存
├── components/                   # React 组件
│   ├── UploadTab.tsx            # 上传组件
│   └── HistoryTab.tsx           # 历史记录组件
├── lib/                         # 工具库
│   ├── supabase/                # Supabase 客户端
│   ├── doubao/                  # 豆包 API 调用
│   ├── categories.ts             # 分类定义
│   └── types.ts                 # TypeScript 类型
└── supabase/                    # 数据库脚本
    ├── schema.sql               # 表结构
    └── rls-policy.sql           # RLS 策略
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Tazten/tazten.git
cd tazten
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件，参考 `env-template.txt`：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥

# 豆包 API 配置
ARK_API_KEY=你的豆包API密钥
DOUBAO_MODEL_ENDPOINT=你的模型端点
```

### 4. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/schema.sql` 创建表结构。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📋 功能说明

### 上传账单

1. 点击或拖拽上传账单图片
2. 系统自动上传到 Supabase Storage
3. 调用豆包 API 识别账单信息
4. 验证并保存到数据库
5. 显示识别结果

### 历史记录

- 查看所有交易记录（按时间倒序）
- 支持筛选：全部/支出/收入
- 显示统计信息：总记录数、总支出、总收入
- 点击记录查看详情

### 交易详情

- 原始账单图片（可点击放大）
- 基本信息：类型、金额、商户、时间
- 分类信息：一级分类、二级分类、备注、置信度
- 识别文本：AI 提取的原始文本
- JSON 数据：完整的识别结果

## 🎨 分类体系

### 支出分类

- **饮食**: 餐饮、水果、零食、饮料
- **出行**: 交通、娱乐、社交、旅行
- **日用**: 日用品、衣服、鞋包、配饰、家居用品
- **住房**: 房租、水电、燃气、网络、通讯
- **其他**: 理财、人情、爱好、学习、医疗

### 收入分类

- 工资
- 兼职
- 理财
- 其他

## 🔧 开发

### 验证 Supabase 连接

```bash
npm run verify:supabase
```

### 构建生产版本

```bash
npm run build
npm start
```

## 📚 相关文档

- [快速启动指南](./快速启动指南.md)
- [Vercel 部署指南](./Vercel部署指南.md)
- [Supabase 配置说明](./Supabase配置说明.md)
- [豆包 API 配置指南](./豆包API配置指南.md)

## ⚠️ 注意事项

- 上传内容对所有用户可见，请勿上传包含个人隐私信息的图片
- 本系统使用 Doubao-Seed-1.6-Flash 模型，每日提供 150万 token 免费额度
- 置信度低于 0.7 的记录会被标记为"需审核"

## 📄 License

本项目仅用于作业展示。
