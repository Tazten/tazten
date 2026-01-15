# TOS 图片上传指南

## 方法一：使用 Python 脚本上传

### 1. 安装 TOS SDK

```bash
pip install tos
```

### 2. 配置凭证

设置环境变量：

```bash
export TOS_ACCESS_KEY="你的访问密钥"
export TOS_SECRET_KEY="你的秘密密钥"
export TOS_ENDPOINT="tos-cn-beijing.volces.com"  # 可选
export TOS_REGION="cn-beijing"  # 可选
```

或者修改 `upload_to_tos.py` 脚本中的凭证配置。

### 3. 上传图片

```bash
# 上传图片（使用文件名作为对象键）
python upload_to_tos.py image.jpg

# 指定对象键名
python upload_to_tos.py image.jpg images/screenshot.jpg
```

## 方法二：使用 TOS 控制台上传

1. 访问 [火山引擎 TOS 控制台](https://console.volcengine.com/tos)
2. 选择存储桶 `tazten`
3. 点击"上传对象"
4. 选择图片文件上传

## 方法三：安装 tosutil 命令行工具

### 安装

```bash
# macOS
brew install tosutil

# 或下载安装包
# https://www.volcengine.com/docs/6349/107947
```

### 配置

```bash
tosutil config
```

### 上传

```bash
tosutil cp image.jpg tos://tazten/images/image.jpg
```

## TOS MCP 限制说明

当前 TOS MCP 只支持**读取操作**：
- ✅ 列出存储桶
- ✅ 列出对象
- ✅ 获取对象内容

不支持写入操作，因此需要通过上述方式上传文件。

## 上传后验证

上传完成后，可以使用 TOS MCP 查询：

```python
# 列出对象
mcp_tos_list_objects(bucket="tazten", prefix="images/")

# 获取对象
mcp_tos_get_object(bucket="tazten", key="images/image.jpg")
```

