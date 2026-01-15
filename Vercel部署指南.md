# Vercel 部署指南

## 📋 部署前检查清单

### 1. 代码准备
- ✅ 所有功能已测试通过
- ✅ 代码已提交到 Git 仓库
- ✅ 没有未提交的更改

### 2. 环境变量准备

需要在 Vercel 中配置以下环境变量：

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

#### 豆包 API 配置
```
ARK_API_KEY=你的豆包API密钥
DOUBAO_MODEL_ENDPOINT=ep-20260115171348-vk8kc
```

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库 `tazten`
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: **Next.js**（自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）

4. **配置环境变量**
   - 在 "Environment Variables" 部分
   - 添加所有必需的环境变量（见上方列表）
   - 确保所有环境（Production, Preview, Development）都配置

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```
   
   首次部署会提示：
   - 是否链接到现有项目？选择 `N`（创建新项目）
   - 项目名称：`tazten`（或自定义）
   - 是否覆盖设置？选择 `N`

4. **配置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add ARK_API_KEY
   vercel env add DOUBAO_MODEL_ENDPOINT
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 🔧 环境变量配置说明

### 在 Vercel Dashboard 中配置

1. 进入项目设置
2. 点击 "Environment Variables"
3. 逐个添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase Service Role Key | Production, Preview, Development |
| `ARK_API_KEY` | 你的豆包 API Key | Production, Preview, Development |
| `DOUBAO_MODEL_ENDPOINT` | `ep-20260115171348-vk8kc` | Production, Preview, Development |

⚠️ **重要**：`SUPABASE_SERVICE_ROLE_KEY` 和 `ARK_API_KEY` 是敏感信息，不要提交到 Git！

## ✅ 部署后验证

1. **访问部署的网站**
   - Vercel 会提供一个 URL，如：`https://tazten.vercel.app`

2. **测试功能**
   - ✅ 访问首页，检查 UI 是否正常
   - ✅ 测试上传图片功能
   - ✅ 测试使用默认图片功能
   - ✅ 检查历史记录页面
   - ✅ 检查详情页面

3. **检查日志**
   - 在 Vercel Dashboard 中查看 "Deployments"
   - 点击最新的部署，查看构建日志
   - 如有错误，检查环境变量是否正确配置

## 🐛 常见问题

### 1. 构建失败

**问题**：`Error: Missing environment variable`

**解决**：
- 检查所有环境变量是否都已配置
- 确保变量名拼写正确
- 重新部署

### 2. API 调用失败

**问题**：上传图片后显示错误

**解决**：
- 检查 `ARK_API_KEY` 是否正确
- 检查 `DOUBAO_MODEL_ENDPOINT` 是否正确
- 检查 Supabase 环境变量是否正确

### 3. 数据库连接失败

**问题**：无法加载历史记录

**解决**：
- 检查 Supabase 环境变量
- 确认 Supabase RLS 策略已配置（或已禁用）
- 检查 Supabase Storage bucket 是否已创建

## 📝 后续维护

### 更新代码
1. 提交代码到 Git
2. Vercel 会自动检测并重新部署
3. 或手动触发部署：`vercel --prod`

### 更新环境变量
1. 在 Vercel Dashboard 中修改
2. 重新部署项目

### 查看日志
- Vercel Dashboard → 项目 → Deployments → 选择部署 → Logs

## 🎉 部署完成

部署成功后，你的网站就可以通过 Vercel 提供的 URL 访问了！

---

**提示**：建议将 Vercel URL 添加到 Supabase 的 CORS 设置中（如果需要）。

