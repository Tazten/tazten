#!/bin/bash

# 创建 .env.local 文件的脚本

cat > .env.local << 'EOF'
# Supabase 配置
# 在 Supabase Dashboard (https://app.supabase.com) → Settings → API 中获取
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 火山引擎 TOS 配置
# 在火山引擎控制台 (https://console.volcengine.com/tos) 中获取
TOS_ACCESS_KEY=your-tos-access-key
TOS_SECRET_KEY=your-tos-secret-key
TOS_ENDPOINT=tos-cn-beijing.volces.com
TOS_REGION=cn-beijing
TOS_BUCKET_NAME=tazten

# 火山引擎豆包视觉理解 API
# 在火山引擎控制台开通服务后获取
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
EOF

echo "✅ .env.local 文件已创建！"
echo ""
echo "📝 下一步："
echo "1. 打开 .env.local 文件"
echo "2. 将 your-xxx 替换为实际的值"
echo "3. 保存文件"
echo ""
echo "💡 提示：文件位置：$(pwd)/.env.local"

