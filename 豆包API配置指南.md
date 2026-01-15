# 豆包视觉理解 API 配置指南

## 📋 需要配置的内容

### 1. 获取 API Key

1. 登录 [火山引擎控制台](https://console.volcengine.com)
2. 开通 **豆包视觉理解** 服务（如果还没开通）
3. 创建 API Key
4. 记录 API Key

### 2. 确认 API 端点

根据火山引擎豆包 API 文档，确认正确的 API 端点 URL。

常见的端点格式：
- `https://ark.cn-beijing.volces.com/api/v3`
- 或其他区域端点

### 3. 配置环境变量

在 `.env.local` 文件中配置：

```bash
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

## 🔧 代码实现

当前代码在 `lib/doubao/vision.ts` 中，需要根据实际的豆包 API 文档调整：

1. **API 端点格式** - 确认正确的 URL
2. **请求格式** - 确认请求体格式
3. **响应格式** - 确认响应解析方式
4. **模型名称** - 确认使用的模型名称

## 📝 当前实现状态

代码中已经实现了基本的调用框架，但可能需要根据实际 API 文档调整：

- ✅ 基本请求结构
- ✅ 错误处理
- ✅ JSON 解析
- ⚠️ 需要确认实际的 API 格式

## 🚀 下一步

1. **配置环境变量** - 填入 `DOUBAO_API_KEY` 和 `DOUBAO_BASE_URL`
2. **查看豆包 API 文档** - 确认实际的 API 格式
3. **调整代码** - 根据文档调整 `lib/doubao/vision.ts`
4. **测试调用** - 测试图片识别功能

## 💡 提示

如果豆包 API 的格式与当前代码不同，告诉我实际的 API 文档，我可以帮你调整代码。

---

**配置好环境变量后，我们可以测试完整的流程！** 🚀

