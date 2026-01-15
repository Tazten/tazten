import { supabaseServer } from './server'

const BUCKET_NAME = 'bill-images'

/**
 * 生成唯一的文件名
 */
export function generateObjectKey(originalFileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = originalFileName.split('.').pop() || 'jpg'
  return `${timestamp}-${random}.${ext}`
}

/**
 * 上传图片到 Supabase Storage
 */
export async function uploadImageToSupabase(
  file: File,
  fileName: string
): Promise<{ url: string; path: string }> {
  // 减少日志输出以提高性能
  if (process.env.NODE_ENV === 'development') {
    console.log(`📦 上传图片到 ${BUCKET_NAME}: ${fileName}`)
  }
  
  // 确保 bucket 存在（如果不存在会报错，需要先在 Supabase 控制台创建）
  const { data, error } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    })

  if (error) {
    console.error('❌ Storage 上传错误:', error.message)
    throw new Error(`上传图片失败: ${error.message}`)
  }

  // 获取公开 URL
  const { data: urlData } = supabaseServer.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ 图片上传成功:', urlData.publicUrl)
  }

  return {
    url: urlData.publicUrl,
    path: data.path
  }
}

