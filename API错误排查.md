# API 500 错误排查指南

## 🔴 错误信息

```
POST /api/parse-and-save 500 in 2357ms
```

## 🔍 排查步骤

### 1. 查看终端日志

在运行 `npm run dev` 的终端中，查看详细的错误信息。应该能看到：
- 错误堆栈信息
- 具体是哪个步骤失败了

### 2. 检查环境变量

确认 `.env.local` 文件中所有必需的环境变量都已配置：

```bash
# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 豆包 API（必需）
DOUBAO_API_KEY=...
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL_ENDPOINT=ep-20260115161308-w22bh
```

### 3. 检查 Supabase Storage

确认 `bill-images` bucket 已创建：
1. 登录 Supabase Dashboard
2. 进入 Storage
3. 确认 `bill-images` bucket 存在且为公开访问

### 4. 检查数据库表

确认 `transactions` 表已创建：
1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 确认 `transactions` 表存在

### 5. 检查 RLS 策略

如果数据库操作失败，可能需要禁用 RLS：

```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

## 🐛 常见错误原因

### 1. 环境变量未加载

**症状**: 错误信息包含 "undefined" 或 "Missing environment variables"

**解决**: 
- 确认 `.env.local` 文件存在
- 重启开发服务器 (`npm run dev`)
- 确认环境变量名称正确（注意大小写）

### 2. Supabase Storage bucket 不存在

**症状**: 错误信息包含 "bucket" 或 "storage"

**解决**: 
- 在 Supabase Dashboard → Storage 中创建 `bill-images` bucket
- 设置为公开访问

### 3. 豆包 API 调用失败

**症状**: 错误信息包含 "豆包" 或 "API"

**解决**:
- 检查 `DOUBAO_API_KEY` 是否正确
- 检查 `DOUBAO_MODEL_ENDPOINT` 是否正确
- 检查图片 URL 是否可以访问

### 4. 数据库插入失败

**症状**: 错误信息包含 "insert" 或 "database"

**解决**:
- 检查表结构是否正确
- 检查 RLS 策略（API 使用 Service Role Key，应该可以绕过）
- 检查字段类型是否匹配

## 🔧 调试方法

### 方法 1: 查看终端日志

在运行 `npm run dev` 的终端中，查看完整的错误堆栈。

### 方法 2: 添加日志

在浏览器开发者工具 → Network 中：
1. 找到 `/api/parse-and-save` 请求
2. 查看 Response，应该包含详细的错误信息

### 方法 3: 检查服务器日志

API 路由现在会输出详细的错误信息到控制台。

## 📋 快速检查清单

- [ ] `.env.local` 文件存在且配置正确
- [ ] 重启了开发服务器
- [ ] `bill-images` bucket 已创建
- [ ] `transactions` 表已创建
- [ ] RLS 策略已配置（或已禁用）
- [ ] 豆包 API Key 正确
- [ ] 查看终端中的详细错误信息

## 🚀 下一步

1. **查看终端日志** - 找到具体的错误信息
2. **根据错误信息** - 按照上面的解决方案处理
3. **重新测试** - 上传图片再次尝试

---

**请把终端中的详细错误信息发给我，我可以帮你精确定位问题！** 🔍

