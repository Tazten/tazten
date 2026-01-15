# Google Analytics 事件追踪说明

## 📊 接入状态

✅ **已成功接入 Google Analytics**
- Measurement ID: `G-5HPGNXBYCE`
- 使用 Next.js Script 组件加载，确保性能优化

## 🎯 追踪的用户行为

### 1. 页面浏览事件

#### `page_view`
**触发时机**: 用户访问首页或历史记录页面
**参数**:
- `page`: 页面类型 (`home` | `history`)

**说明**: 追踪用户访问的主要页面，了解用户浏览路径

---

#### `page_view_core_flow`
**触发时机**: 用户进入上传页面（核心流程）
**参数**:
- `page`: `upload`

**说明**: 专门追踪核心业务流程（上传账单）的访问量，这是产品的核心功能

---

### 2. 图片上传事件

#### `upload_image`
**触发时机**: 用户选择并上传图片文件
**参数**:
- `file_type`: 文件类型（如 `image/jpeg`）
- `file_size`: 文件大小（字节）
- `file_name`: 文件名（前50个字符）

**说明**: 追踪用户上传行为，了解：
- 用户上传频率
- 文件类型分布
- 文件大小分布
- 帮助优化上传体验

---

### 3. 提交操作事件

#### `click_submit`
**触发时机**: 用户点击"开始识别"或"使用默认图片体验流程"按钮
**参数**:
- `use_default`: 是否使用默认图片（布尔值）
- `has_file`: 是否有上传文件（布尔值）

**说明**: 追踪用户提交行为，了解：
- 用户提交频率
- 使用默认图片 vs 真实上传的比例
- 帮助优化提交流程

---

### 4. 记录添加事件

#### `add_record`
**触发时机**: 成功识别并保存账单记录到数据库
**参数**:
- `direction`: 交易方向 (`expense` | `income`)
- `amount`: 金额
- `currency`: 货币代码
- `category`: 分类
- `confidence`: 置信度（0-1）
- `use_default`: 是否使用默认图片

**说明**: 追踪成功添加的记录，了解：
- 成功识别率
- 支出 vs 收入的比例
- 不同分类的分布
- 识别置信度分布
- 帮助评估 AI 识别效果

---

#### `submit_failed`
**触发时机**: 提交失败时
**参数**:
- `error`: 错误信息
- `use_default`: 是否使用默认图片

**说明**: 追踪失败情况，帮助发现和解决问题

---

### 5. 历史记录相关事件

#### `filter_transactions`
**触发时机**: 用户切换筛选器（全部/支出/收入）
**参数**:
- `filter`: 筛选类型 (`all` | `expense` | `income`)

**说明**: 追踪用户筛选行为，了解：
- 用户最常查看哪种类型的记录
- 帮助优化筛选功能

---

#### `view_transaction_detail`
**触发时机**: 用户点击交易记录查看详情
**参数**:
- `transaction_id`: 交易ID
- `direction`: 交易方向
- `amount`: 金额

**说明**: 追踪详情页访问，了解：
- 用户查看详情的频率
- 哪些类型的记录更受关注

---

### 6. 标签切换事件

#### `tab_switch`
**触发时机**: 用户在上传和历史记录之间切换标签
**参数**:
- `from`: 来源标签 (`upload` | `history`)
- `to`: 目标标签 (`upload` | `history`)

**说明**: 追踪用户在不同功能间的切换行为，了解用户使用习惯

---

## 📈 数据分析建议

### 核心指标

1. **转化漏斗**:
   - `page_view_core_flow` → `upload_image` → `click_submit` → `add_record`
   - 分析每个步骤的流失率

2. **成功率**:
   - `add_record` / `click_submit` = 识别成功率
   - 帮助评估系统稳定性

3. **用户行为模式**:
   - 通过 `tab_switch` 和 `filter_transactions` 了解用户使用习惯
   - 通过 `page_view` 了解用户访问路径

4. **错误监控**:
   - 通过 `submit_failed` 追踪错误频率和类型
   - 及时发现问题并优化

---

## 🔍 在 Google Analytics 中查看

1. 登录 [Google Analytics](https://analytics.google.com/)
2. 选择对应的属性
3. 进入 **报告** → **参与度** → **事件**
4. 查看各个自定义事件的统计信息

---

## 💡 重点说明

**你能清楚说出你在看什么用户行为**：

1. **用户是否在使用核心功能**：通过 `page_view_core_flow` 和 `upload_image` 追踪
2. **用户是否成功完成流程**：通过 `click_submit` → `add_record` 转化率追踪
3. **用户如何使用历史记录**：通过 `filter_transactions` 和 `view_transaction_detail` 追踪
4. **系统是否稳定**：通过 `submit_failed` 错误率追踪
5. **用户行为模式**：通过 `tab_switch` 了解用户在不同功能间的切换

这些数据帮助我们：
- 优化用户体验
- 发现和解决问题
- 了解产品使用情况
- 指导产品迭代方向

