#!/usr/bin/env python3
"""
TOS 图片上传脚本
使用火山引擎 TOS SDK 上传文件到存储桶
"""

import os
import sys
from pathlib import Path

try:
    import tos
    from tos import TosClientError
except ImportError:
    print("错误: 未安装 TOS SDK")
    print("请运行: pip install tos")
    sys.exit(1)

def upload_file_to_tos(file_path, bucket_name, object_key=None):
    """
    上传文件到 TOS 存储桶
    
    Args:
        file_path: 本地文件路径
        bucket_name: 存储桶名称
        object_key: 对象键名（可选，默认使用文件名）
    """
    # 检查文件是否存在
    if not os.path.exists(file_path):
        print(f"错误: 文件不存在: {file_path}")
        return False
    
    # 如果没有指定对象键，使用文件名
    if object_key is None:
        object_key = os.path.basename(file_path)
    
    # TOS 配置
    # 注意: 需要从环境变量或配置文件中获取凭证
    endpoint = os.getenv('TOS_ENDPOINT', 'tos-cn-beijing.volces.com')
    access_key = os.getenv('TOS_ACCESS_KEY')
    secret_key = os.getenv('TOS_SECRET_KEY')
    region = os.getenv('TOS_REGION', 'cn-beijing')
    
    if not access_key or not secret_key:
        print("错误: 请设置环境变量 TOS_ACCESS_KEY 和 TOS_SECRET_KEY")
        print("或者修改脚本中的凭证配置")
        return False
    
    try:
        # 创建 TOS 客户端
        client = tos.TosClient(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            region=region
        )
        
        # 读取文件内容
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # 获取文件类型
        file_ext = Path(file_path).suffix.lower()
        content_type_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        content_type = content_type_map.get(file_ext, 'application/octet-stream')
        
        # 上传文件
        print(f"正在上传 {file_path} 到 {bucket_name}/{object_key}...")
        
        client.put_object(
            bucket=bucket_name,
            key=object_key,
            body=file_content,
            content_type=content_type
        )
        
        print(f"✅ 上传成功!")
        print(f"   存储桶: {bucket_name}")
        print(f"   对象键: {object_key}")
        print(f"   文件大小: {len(file_content)} 字节")
        
        # 生成访问 URL
        url = f"https://{bucket_name}.{endpoint}/{object_key}"
        print(f"   访问 URL: {url}")
        
        return True
        
    except TosClientError as e:
        print(f"❌ 上传失败: {e}")
        return False
    except Exception as e:
        print(f"❌ 发生错误: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python upload_to_tos.py <图片文件路径> [对象键名]")
        print("\n示例:")
        print("  python upload_to_tos.py image.jpg")
        print("  python upload_to_tos.py image.jpg images/screenshot.jpg")
        print("\n环境变量:")
        print("  TOS_ENDPOINT: TOS 端点 (默认: tos-cn-beijing.volces.com)")
        print("  TOS_ACCESS_KEY: 访问密钥")
        print("  TOS_SECRET_KEY: 秘密密钥")
        print("  TOS_REGION: 区域 (默认: cn-beijing)")
        sys.exit(1)
    
    file_path = sys.argv[1]
    object_key = sys.argv[2] if len(sys.argv) > 2 else None
    bucket_name = 'tazten'
    
    upload_file_to_tos(file_path, bucket_name, object_key)

