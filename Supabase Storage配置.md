# Supabase Storage 配置指南

## ✅ 已切换到 Supabase Storage

我们已经移除了 TOS，改用 Supabase Storage 来存储图片。这样更简单，因为所有功能都在 Supabase 中。

## 📋 配置步骤

### 1. 创建 Storage Bucket

在 Supabase Dashboard 中：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 **Tazten**
3. 进入 **Storage**（左侧菜单）
4. 点击 **New bucket**
5. 配置：
   - **Name**: `bill-images`
   - **Public bucket**: ✅ 勾选（这样可以直接访问图片 URL）
6. 点击 **Create bucket**

### 2. 验证配置

创建完成后，你应该能看到 `bill-images` bucket。

## 🔧 代码已更新

以下文件已更新为使用 Supabase Storage：

- ✅ `app/api/parse-and-save/route.ts` - 使用 Supabase Storage 上传
- ✅ `lib/supabase/storage.ts` - 上传工具函数
- ✅ 移除了 TOS 相关代码

## 📝 环境变量

现在 `.env.local` 中**不需要** TOS 相关的配置了，只需要：

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 火山引擎豆包视觉理解 API（必需）
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

可以删除 TOS 相关的环境变量：
- ~~TOS_ACCESS_KEY~~
- ~~TOS_SECRET_KEY~~
- ~~TOS_ENDPOINT~~
- ~~TOS_REGION~~
- ~~TOS_BUCKET_NAME~~

## ✅ 下一步

1. ✅ 创建 `bill-images` bucket
2. ✅ 运行 `npm install`（已移除 TOS 包）
3. ✅ 运行 `npm run verify:supabase` 验证连接
4. ✅ 测试图片上传功能

---

**创建 bucket 后告诉我，我们继续测试！** 🚀

