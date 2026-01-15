import { tosConfig } from './client'

const BUCKET_NAME = process.env.TOS_BUCKET_NAME || 'tazten'

/**
 * 上传图片到火山引擎 TOS
 * TODO: 需要安装正确的 TOS SDK 包后实现
 */
export async function uploadImageToTOS(
  file: File,
  objectKey: string
): Promise<string> {
  // TODO: 实现 TOS 上传逻辑
  // 需要根据实际的 TOS SDK 文档来实现
  
  // 临时实现：返回一个占位 URL
  // 等 TOS SDK 配置好后，替换为真实的上传逻辑
  throw new Error('TOS SDK 尚未配置，请先安装正确的 TOS SDK 包')
  
  /* 
  const fileBuffer = await file.arrayBuffer()
  
  try {
    await tosClient.putObject({
      bucket: BUCKET_NAME,
      key: objectKey,
      body: Buffer.from(fileBuffer),
      contentType: file.type || 'image/jpeg'
    })

    const endpoint = process.env.TOS_ENDPOINT || 'tos-cn-beijing.volces.com'
    const url = `https://${BUCKET_NAME}.${endpoint}/${objectKey}`
    
    return url
  } catch (error: any) {
    throw new Error(`上传到 TOS 失败: ${error.message}`)
  }
  */
}

/**
 * 生成唯一的对象键名
 */
export function generateObjectKey(fileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = fileName.split('.').pop() || 'jpg'
  return `bill-images/${timestamp}-${random}.${ext}`
}

