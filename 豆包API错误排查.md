# 豆包 API 错误排查

## 🔴 当前错误

```
The service encountered an unexpected internal error. Please retry later.
Request id: 0217684655852241eba3025cbd7470c83681cd6326718b9f383a8
```

## ✅ 已确认正常的部分

1. ✅ 图片上传到 Supabase Storage 成功
2. ✅ 图片 URL 可以访问（公开 URL）
3. ✅ API 请求已发送

## 🔍 可能的原因

### 1. API Key 或 Endpoint ID 不正确

**检查**：
- `DOUBAO_API_KEY` 是否正确
- `DOUBAO_MODEL_ENDPOINT` 是否正确（应该是你的实际 endpoint ID）

### 2. 图片 URL 无法访问

虽然 Supabase Storage URL 是公开的，但豆包 API 可能需要：
- 图片可以直接访问（无认证）
- 图片格式正确
- 图片大小在限制内

### 3. API 请求格式问题

可能请求格式与豆包 API 实际要求不完全匹配。

## 🔧 排查步骤

### 步骤 1: 检查环境变量

确认 `.env.local` 中：
```bash
DOUBAO_API_KEY=你的实际API Key
DOUBAO_MODEL_ENDPOINT=你的实际endpoint ID（如 ep-20260115161308-w22bh）
```

### 步骤 2: 验证图片 URL

在浏览器中直接访问图片 URL，确认可以正常显示：
```
https://jcphhnvbridmzdcfwzar.supabase.co/storage/v1/object/public/bill-images/1768465582964-sugbfk5.jpg
```

### 步骤 3: 查看详细日志

重新上传图片，查看终端中的详细日志：
- API Key 前10位（确认已加载）
- 请求体内容
- 响应状态和内容

### 步骤 4: 测试 API Key

可以用 curl 直接测试：

```bash
curl https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOUBAO_API_KEY" \
  -d '{
     "model": "你的endpoint ID",
     "max_completion_tokens": 65535,
     "messages": [
        {
            "content": [
                {
                    "image_url": {
                        "url": "https://jcphhnvbridmzdcfwzar.supabase.co/storage/v1/object/public/bill-images/1768465582964-sugbfk5.jpg"
                    },
                    "type": "image_url"
                },
                {
                    "text": "图片主要讲了什么?",
                    "type": "text"
                }
            ],
            "role": "user"
        }
    ],
     "reasoning_effort": "medium"
}'
```

## 💡 建议

1. **确认 Endpoint ID** - 你提供的 endpoint ID (`ep-20260115161308-w22bh`) 是否正确？
2. **检查 API Key** - 确认 API Key 有效且未过期
3. **查看豆包控制台** - 在火山引擎控制台查看是否有错误日志

---

**请重新上传图片，查看终端中的详细日志（特别是 API Key 和请求体），然后告诉我结果！** 🔍

