# 进阶作业 MVP 项目设计文档

## ① 项目结构与路由设计

### 目录结构

```
tazten/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（重定向到 /upload）
│   ├── upload/
│   │   └── page.tsx            # 上传页（流程可视化 + 上传入口）
│   ├── transactions/
│   │   ├── page.tsx            # 列表页
│   │   └── [id]/
│   │       └── page.tsx        # 详情页（可选）
│   └── api/
│       └── parse-and-save/
│           └── route.ts        # API 路由：解析并保存
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase 客户端（服务端）
│   │   └── storage.ts          # Storage 上传工具
│   ├── doubao/
│   │   └── vision.ts           # 豆包视觉理解 API 调用
│   └── types.ts                # TypeScript 类型定义
├── components/
│   ├── ProcessFlow.tsx         # 流程可视化组件
│   ├── UploadForm.tsx          # 上传表单组件
│   └── TransactionCard.tsx     # 交易卡片组件
├── .env.local                  # 本地环境变量（不提交）
├── .env.example                # 环境变量示例
├── next.config.js              # Next.js 配置
├── package.json
├── tsconfig.json
└── README.md
```

### 路由设计

| 路由 | 说明 | 功能 |
|------|------|------|
| `/` | 首页 | 重定向到 `/upload` |
| `/upload` | 上传页 | 流程可视化 + 图片上传 + 实时状态展示 |
| `/transactions` | 列表页 | 展示所有交易记录（倒序） |
| `/transactions/[id]` | 详情页 | 单条记录详情（图片、JSON、溯源） |
| `/api/parse-and-save` | API | POST 接收图片，返回解析结果 |

---

## ② Supabase 表结构 SQL

### transactions 表

```sql
-- 创建 transactions 表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 核心账务字段（来自解析结果）
  direction TEXT NOT NULL CHECK (direction IN ('expense', 'income')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  occurred_at TIMESTAMPTZ,
  merchant TEXT,
  category TEXT,
  subcategory TEXT,
  note TEXT,
  
  -- 识别相关
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  raw_text TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'needs_review', 'failed')),
  
  -- 溯源字段
  image_url TEXT NOT NULL,  -- Supabase Storage 的公开 URL
  
  -- 元数据
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_direction ON transactions(direction);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Supabase Storage 设置

1. **创建 Storage Bucket**
   - 名称：`bill-images`
   - 公开访问：是（用于直接展示图片）
   - 文件大小限制：10MB

2. **Storage 策略（可选，MVP 阶段可先不设置）**
   - 如果需要，可以设置 RLS 策略，但 MVP 阶段可以暂时开放

---

## ③ API 数据流与返回结构

### API 端点：`POST /api/parse-and-save`

#### 请求格式

```
Content-Type: multipart/form-data
Body:
  - image: File (图片文件)
```

#### 处理流程

```
1. 接收 FormData，提取图片文件
   ↓
2. 上传图片到 Supabase Storage
   → 得到 image_url (公开 URL)
   ↓
3. 调用豆包视觉理解 API
   → 传入图片 URL 或 base64
   → 强约束输出 JSON 格式
   ↓
4. 解析并校验 JSON
   → 检查必填字段：direction, amount, currency, confidence
   → 计算 status（confidence < 0.7 → needs_review，否则 success）
   ↓
5. 插入 Supabase transactions 表
   → 包含所有字段 + image_url
   ↓
6. 返回结果给前端
```

#### 返回结构

**成功响应（200）**

```typescript
{
  status: "success" | "needs_review" | "failed",
  saved_record: {
    id: string,
    direction: "expense" | "income",
    amount: number,
    currency: string,
    occurred_at: string | null,
    merchant: string | null,
    category: string | null,
    subcategory: string | null,
    note: string | null,
    confidence: number,
    raw_text: string | null,
    image_url: string,
    status: "success" | "needs_review",
    created_at: string
  },
  steps: {
    upload: { status: "success", duration?: number },
    parse: { status: "success", duration?: number },
    validate: { status: "success", duration?: number },
    save: { status: "success", duration?: number }
  }
}
```

**失败响应（400/500）**

```typescript
{
  status: "failed",
  error: string,  // 可理解的错误信息
  step: "upload" | "parse" | "validate" | "save",  // 失败步骤
  steps: {
    upload?: { status: "success" | "failed", duration?: number },
    parse?: { status: "success" | "failed", duration?: number, error?: string },
    validate?: { status: "success" | "failed", duration?: number, error?: string },
    save?: { status: "success" | "failed", duration?: number, error?: string }
  }
}
```

#### 字段校验规则

| 字段 | 必填 | 校验规则 |
|------|------|----------|
| direction | ✅ | 必须是 "expense" 或 "income" |
| amount | ✅ | 必须是正数 |
| currency | ✅ | 不能为空，建议 "CNY"/"USD" 等 |
| confidence | ✅ | 0~1 之间的数值 |
| occurred_at | ❌ | ISO 8601 格式字符串或 null |
| merchant | ❌ | 字符串或 null |
| category | ❌ | 字符串或 null |
| subcategory | ❌ | 字符串或 null |
| note | ❌ | 字符串或 null |
| raw_text | ❌ | 字符串或 null |

---

## ④ 环境变量清单

### 本地开发（.env.local）

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 火山方舟豆包视觉理解
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # 示例，根据实际调整
```

### Vercel 部署配置

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production, Preview, Development |
| `DOUBAO_API_KEY` | `xxx` | Production, Preview, Development |
| `DOUBAO_BASE_URL` | `https://ark.cn-beijing.volces.com/api/v3` | Production, Preview, Development |

### 环境变量说明

- **NEXT_PUBLIC_***：前端可访问（会暴露到浏览器）
- **SUPABASE_SERVICE_ROLE_KEY**：仅服务端使用，用于绕过 RLS（如有）
- **DOUBAO_API_KEY**：仅服务端使用，调用豆包 API

---

## 下一步

请确认以上设计后，我将开始实现：
1. 初始化 Next.js 项目结构
2. 实现 API 路由
3. 实现上传页与列表页
4. 集成 Supabase 与豆包 API

