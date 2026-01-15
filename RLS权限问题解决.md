# RLS 权限问题解决方案

## 🔴 错误信息

```
The service encountered an unexpected internal error. Please retry later.
```

这个错误通常是由于 Supabase 的 RLS (Row Level Security) 策略导致的。

## 🔧 解决方案

### 方案 1: 禁用 RLS（快速解决，适合开发/测试）

在 Supabase Dashboard → SQL Editor 中执行：

```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

### 方案 2: 配置 RLS 策略（推荐用于生产）

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 启用 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow public read access" ON transactions
  FOR SELECT
  USING (true);

-- 允许所有人插入
CREATE POLICY "Allow public insert access" ON transactions
  FOR INSERT
  WITH CHECK (true);
```

### 方案 3: 使用 Service Role Key（已在 API 路由中使用）

API 路由 (`app/api/parse-and-save/route.ts`) 已经使用了 Service Role Key，可以绕过 RLS。

但前端组件 (`HistoryTab.tsx`) 使用的是 Anon Key，需要配置 RLS 策略。

## 📋 检查清单

- [ ] 在 Supabase Dashboard → SQL Editor 执行 RLS 策略 SQL
- [ ] 确认 `transactions` 表存在
- [ ] 确认环境变量已正确配置
- [ ] 刷新浏览器页面

## 🚀 快速修复步骤

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 **Tazten**
3. 进入 **SQL Editor**
4. 执行以下 SQL（最简单的方式）：

```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

5. 刷新浏览器页面

## ⚠️ 注意事项

- **开发环境**：可以禁用 RLS 快速测试
- **生产环境**：建议启用 RLS 并配置合适的策略
- Service Role Key 可以绕过 RLS，但只在服务端使用

---

**执行 SQL 后，刷新页面应该就能正常工作了！** 🚀

