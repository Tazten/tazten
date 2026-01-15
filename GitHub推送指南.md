# GitHub 推送认证问题解决指南

## 问题说明

GitHub 已经不再支持密码认证，需要使用 **Personal Access Token (PAT)** 或 **SSH 密钥**。

## 解决方案一：使用 Personal Access Token（推荐，最简单）

### 步骤 1：创建 Personal Access Token

1. 访问 GitHub：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 填写信息：
   - **Note**: `tazten-project`（任意名称）
   - **Expiration**: 选择过期时间（建议 90 天或 No expiration）
   - **Scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 "Generate token"
5. **重要**：复制生成的 token（只显示一次，类似：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 步骤 2：使用 Token 推送

在终端执行：

```bash
git push -u origin main
```

当提示输入密码时：
- **Username**: `tangziteng@foxmail.com`
- **Password**: 粘贴刚才复制的 Personal Access Token（不是你的 GitHub 密码）

### 步骤 3：保存凭据（可选）

为了避免每次都输入，可以配置 Git 凭据助手：

```bash
# macOS
git config --global credential.helper osxkeychain

# 或者使用 cache（15分钟）
git config --global credential.helper cache
```

## 解决方案二：使用 SSH（推荐用于长期使用）

### 步骤 1：检查是否已有 SSH 密钥

```bash
ls -al ~/.ssh
```

如果看到 `id_rsa` 和 `id_rsa.pub` 或 `id_ed25519` 和 `id_ed25519.pub`，说明已有密钥。

### 步骤 2：如果没有 SSH 密钥，创建一个

```bash
ssh-keygen -t ed25519 -C "tangziteng@foxmail.com"
```

按 Enter 使用默认路径，可以设置密码（可选）。

### 步骤 3：添加 SSH 密钥到 GitHub

1. 复制公钥内容：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   或
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

2. 访问 GitHub：https://github.com/settings/keys
3. 点击 "New SSH key"
4. **Title**: `MacBook Pro`（任意名称）
5. **Key**: 粘贴刚才复制的公钥内容
6. 点击 "Add SSH key"

### 步骤 4：更改远程仓库 URL 为 SSH

```bash
cd /Users/tangziteng/github/tazten
git remote set-url origin git@github.com:Tazten/tazten.git
```

### 步骤 5：推送

```bash
git push -u origin main
```

首次使用 SSH 时会提示确认，输入 `yes` 即可。

## 快速解决方案（推荐）

**最简单的方式**：使用 Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 生成新 token（勾选 `repo` 权限）
3. 复制 token
4. 执行 `git push -u origin main`
5. 密码处粘贴 token

---

**提示**：如果使用 Personal Access Token，建议保存到密码管理器，方便以后使用。

