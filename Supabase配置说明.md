# Supabase 配置说明

## 📋 需要 3 个配置值

在 Supabase Dashboard 中，你需要获取以下 3 个值：

### 1. Project URL
- **位置**: Supabase Dashboard → Settings → API → **Project URL**
- **对应变量**: `NEXT_PUBLIC_SUPABASE_URL`
- **示例**: `https://xxxxxxxxxxxxx.supabase.co`

### 2. Publishable API Key (anon key)
- **位置**: Supabase Dashboard → Settings → API → **Project API keys** → **anon public**
- **对应变量**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的一串）

### 3. Service Role Key ⚠️（这个很重要！）
- **位置**: Supabase Dashboard → Settings → API → **Project API keys** → **service_role**（需要点击 "Reveal" 显示）
- **对应变量**: `SUPABASE_SERVICE_ROLE_KEY`
- **示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（也很长的一串）
- **注意**: 这个 key 是保密的，不要暴露给前端！

## 📝 填写位置

打开 `.env.local` 文件，找到以下三行并替换：

```bash
# 替换这一行
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# ↓ 改为你的 Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# 替换这一行
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# ↓ 改为你的 Publishable API Key (anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 替换这一行
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ↓ 改为你的 Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔍 如何找到 Service Role Key

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 **Tazten**
3. 进入 **Settings**（左侧菜单）
4. 点击 **API**
5. 在 **Project API keys** 部分，找到 **service_role** key
6. 点击 **Reveal** 按钮显示完整 key
7. 复制这个 key

## ⚠️ 为什么需要 Service Role Key？

- **anon key**: 用于前端，有 RLS（Row Level Security）限制
- **service_role key**: 用于服务端 API，可以绕过 RLS，直接操作数据库

我们的 API 路由 (`app/api/parse-and-save/route.ts`) 需要直接插入数据到数据库，所以必须使用 `service_role` key。

## ✅ 配置示例

配置完成后，`.env.local` 文件应该类似这样：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM4OTY3MjkwLCJleHAiOjE5NTQ1NDMyOTB9.yyyyyyyyyyyyyyyy

# ... 其他配置
```

## 🚀 下一步

配置完 Supabase 后，我们还需要：
- [ ] TOS 配置（图片上传）
- [ ] 豆包 API 配置（图片识别）

但先完成 Supabase 配置，我们可以先测试数据库连接！

