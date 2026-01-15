# Google Analytics 配置指南

## 📋 配置步骤

### 第一步：创建 Google Analytics 账号

1. **访问 Google Analytics**
   - 打开：https://analytics.google.com/
   - 使用你的 Google 账号登录

2. **创建账号（如果还没有）**
   - 点击左下角的"管理"（齿轮图标）
   - 点击"创建账号"
   - 填写账号信息：
     - **账号名称**: `Tazten` 或 `个人项目`
     - **国家或地区**: 选择你的地区
     - **时区**: 选择你的时区
   - 点击"下一步"

### 第二步：创建属性（Property）

1. **设置属性**
   - **属性名称**: `无感记账` 或 `Bill Recognition`
   - **报告时区**: 选择你的时区
   - **货币**: 选择你的货币（如 CNY）
   - 点击"下一步"

2. **业务信息（可选）**
   - 选择行业类别：`技术` 或 `其他`
   - 选择业务规模：根据实际情况选择
   - 点击"创建"

3. **接受服务条款**
   - 阅读并接受 Google Analytics 服务条款
   - 点击"我接受"

### 第三步：获取 Measurement ID

1. **找到 Measurement ID**
   - 创建属性后，会显示"数据流"设置页面
   - 或者点击左下角"管理" → "数据流"
   - 点击"添加数据流" → 选择"网站"

2. **配置数据流**
   - **网站网址**: 输入你的网站 URL（如 `https://your-project.vercel.app`）
   - **数据流名称**: `无感记账网站`
   - 点击"创建数据流"

3. **复制 Measurement ID**
   - 创建后会显示 Measurement ID（格式：`G-XXXXXXXXXX`）
   - **重要**：复制这个 ID，我们已经在代码中使用了 `G-5HPGNXBYCE`
   - 如果 ID 不同，需要更新代码中的 ID

### 第四步：验证配置

#### 方法一：使用 Google Analytics 实时报告

1. 访问你的网站（本地或生产环境）
2. 在 Google Analytics 中：
   - 点击左侧"报告"
   - 点击"实时"
   - 你应该能看到你的访问记录

#### 方法二：使用浏览器开发者工具

1. 打开你的网站
2. 按 `F12` 打开开发者工具
3. 切换到"网络"（Network）标签
4. 筛选 `gtag` 或 `collect`
5. 你应该能看到发送到 Google Analytics 的请求

#### 方法三：使用 Google Tag Assistant（推荐）

1. 安装 Chrome 扩展：[Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. 访问你的网站
3. 点击扩展图标
4. 点击"Enable"
5. 刷新页面
6. 你应该能看到 Google Analytics 标签被检测到

---

## 🔧 如果 Measurement ID 不同

如果你获取的 Measurement ID 不是 `G-5HPGNXBYCE`，需要更新代码：

### 更新位置 1：`app/layout.tsx`

```typescript
// 找到这两处，替换为你的 Measurement ID
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=你的MeasurementID`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '你的MeasurementID');
  `}
</Script>
```

### 更新位置 2：`lib/analytics.ts`（如果需要）

如果使用 `initGA` 函数，也需要更新：

```typescript
const GA_MEASUREMENT_ID = '你的MeasurementID'
```

---

## 📊 查看事件数据

### 实时查看

1. 登录 Google Analytics
2. 点击"报告" → "实时" → "事件"
3. 你应该能看到实时触发的事件

### 查看历史数据

1. 点击"报告" → "参与度" → "事件"
2. 等待几分钟（数据有延迟）
3. 你应该能看到所有自定义事件：
   - `upload_image`
   - `click_submit`
   - `add_record`
   - `page_view_core_flow`
   - 等等...

---

## ✅ 配置检查清单

- [ ] 已创建 Google Analytics 账号
- [ ] 已创建属性（Property）
- [ ] 已创建数据流（Data Stream）
- [ ] 已获取 Measurement ID
- [ ] 已确认代码中的 Measurement ID 正确
- [ ] 已部署到生产环境（Vercel）
- [ ] 已在 Google Analytics 中看到实时数据
- [ ] 已测试自定义事件是否正常触发

---

## 🐛 常见问题

### Q: 看不到数据怎么办？

1. **检查 Measurement ID 是否正确**
   - 确认代码中的 ID 和 Google Analytics 中的一致

2. **检查是否已部署**
   - 本地开发环境可能被广告拦截器阻止
   - 建议在生产环境（Vercel）测试

3. **等待数据延迟**
   - Google Analytics 数据有 24-48 小时延迟
   - 实时报告应该立即显示（几分钟内）

4. **检查广告拦截器**
   - 某些浏览器扩展可能阻止 Google Analytics
   - 尝试禁用广告拦截器后测试

### Q: 如何确认事件已正确配置？

1. 打开浏览器开发者工具（F12）
2. 切换到"控制台"（Console）
3. 执行操作（如上传图片）
4. 在控制台输入：`window.dataLayer`
5. 你应该能看到事件数据

### Q: 如何测试自定义事件？

1. 访问你的网站
2. 打开浏览器开发者工具 → 控制台
3. 手动触发事件：
   ```javascript
   window.gtag('event', 'test_event', {
     test_param: 'test_value'
   })
   ```
4. 在 Google Analytics 实时报告中查看

---

## 📚 相关资源

- [Google Analytics 官方文档](https://support.google.com/analytics)
- [Google Analytics 事件追踪指南](https://developers.google.com/analytics/devguides/collection/gtagjs/events)
- [Next.js + Google Analytics 最佳实践](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)

---

## 💡 提示

- **隐私政策**：如果网站面向公众，建议添加隐私政策说明使用了 Google Analytics
- **GDPR 合规**：如果用户来自欧盟，可能需要 Cookie 同意提示
- **数据保留**：Google Analytics 免费版数据保留 14 个月

