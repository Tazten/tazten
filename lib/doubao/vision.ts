/**
 * 调用火山引擎豆包视觉理解 API
 * 解析账单图片，返回结构化 JSON
 */

// 支持两种环境变量名（DOUBAO_API_KEY 或 ARK_API_KEY）
const API_KEY = process.env.ARK_API_KEY || process.env.DOUBAO_API_KEY!
const BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3' // 固定 URL
const MODEL_ENDPOINT = process.env.DOUBAO_MODEL_ENDPOINT || process.env.ARK_MODEL_ENDPOINT || 'ep-20260115171348-vk8kc'

if (!API_KEY) {
  throw new Error('ARK_API_KEY 或 DOUBAO_API_KEY 环境变量未设置')
}

export interface DoubaoVisionResponse {
  direction: "expense" | "income";
  amount: number;
  currency: string;
  occurred_at: string | null;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
  note: string | null;
  confidence: number;
  raw_text: string | null;
}

/**
 * 调用豆包视觉理解 API 解析图片
 */
export async function parseBillImage(imageUrl: string): Promise<DoubaoVisionResponse> {
  // 减少日志输出以提高性能
  if (process.env.NODE_ENV === 'development') {
    console.log('🤖 调用豆包 API，模型:', MODEL_ENDPOINT)
  }
  
  // 使用新的 API 格式
  const requestBody = {
    model: MODEL_ENDPOINT, // 使用环境变量中的 endpoint
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: imageUrl // 直接使用字符串 URL
          },
          {
            type: 'input_text',
            text: `识别账单图片，返回JSON格式。必须包含以下字段：
- direction: "expense" 或 "income"
- amount: 金额（数字）
- currency: 货币代码（如 "CNY"）
- occurred_at: ISO 时间字符串或 null
- merchant: 商户名称或 null（必须是平台名/店铺名/品牌名，如"快车"、"网约车"、"滴滴出行"、"星巴克"等，不要填司机名或个人名）
- category: 一级分类（必须从以下分类中选择，不能自创）
- subcategory: 二级分类（必须从对应一级分类的二级分类中选择，不能自创，支出类型不能为null）
- note: 备注或 null
- confidence: 置信度（0-1 之间的数字）
- raw_text: 识别到的原始文本或 null

分类规则：
如果 direction 是 "expense"（支出），category 必须从以下选择：
- 饮食（subcategory: 餐饮/水果/零食/饮料）
- 出行（subcategory: 交通/娱乐/社交/旅行）
- 日用（subcategory: 日用品/衣服/鞋包/配饰/家居用品）
- 住房（subcategory: 房租/水电/燃气/网络/通讯）
- 其他（subcategory: 理财/人情/爱好/学习/医疗）

如果 direction 是 "income"（收入），category 必须从以下选择：
- 工资（subcategory 为 null）
- 兼职（subcategory 为 null）
- 理财（subcategory 为 null）
- 其他（subcategory 为 null）

重要要求：
1. merchant 必须是平台/店铺/品牌名称，不是司机名、个人名或车牌号
2. subcategory 必须严格匹配上述分类，支出类型不能为 null
3. category 和 subcategory 必须严格匹配上述分类，不能自创
4. note 和 raw_text 如果图片中有信息则必须填写

只返回 JSON，不要其他内容。`
          }
        ]
      }
    ]
  }
  
  const startTime = Date.now()
  const response = await fetch(`${BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  })

  const duration = Date.now() - startTime
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ 豆包 API 响应时间: ${(duration / 1000).toFixed(2)}s`)
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ 错误响应内容:', errorText)
    
    let errorMessage = `豆包 API 调用失败: ${response.status} ${response.statusText}`
    try {
      const errorJson = JSON.parse(errorText)
      console.error('❌ 错误 JSON:', JSON.stringify(errorJson, null, 2))
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage
    } catch {
      errorMessage = `${errorMessage}\n响应内容: ${errorText.substring(0, 500)}`
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📥 API 响应状态:', data.status)
  }
  
  // 解析返回的 JSON
  // 新 API 格式: { output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "..." }] }] }
  let content = ''
  
  // 从 output 数组中查找 message 类型的项
  if (data.output && Array.isArray(data.output)) {
    // 找到 type 为 "message" 且 role 为 "assistant" 的项
    const messageItem = data.output.find((item: any) => 
      item.type === 'message' && item.role === 'assistant'
    )
    
    if (messageItem && messageItem.content && Array.isArray(messageItem.content)) {
      // 从 content 数组中查找 type 为 "output_text" 的项
      const textContent = messageItem.content.find((item: any) => item.type === 'output_text')
      content = textContent?.text || ''
    }
  }
  
  // 向后兼容：尝试旧格式 choices
  if (!content && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    content = data.choices[0]?.message?.content || ''
  }
  
  if (!content) {
    console.error('❌ 无法解析 API 响应，output 结构:', JSON.stringify(data.output, null, 2))
    throw new Error('豆包 API 返回内容为空或格式未知')
  }
  
  // 提取 JSON（可能包含 markdown 代码块）
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                    content.match(/```\s*([\s\S]*?)\s*```/) ||
                    [null, content.trim()]
  
  const jsonStr = jsonMatch[1] || content.trim()
  
  try {
    const parsed = JSON.parse(jsonStr)
    
    // 验证必填字段
    if (!parsed.direction || !['expense', 'income'].includes(parsed.direction)) {
      throw new Error('direction 字段无效或缺失')
    }
    if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      throw new Error('amount 字段无效或缺失')
    }
    if (!parsed.currency) {
      throw new Error('currency 字段缺失')
    }
    if (parsed.confidence === undefined) {
      // 如果没有提供置信度，使用默认值
      parsed.confidence = 0.8
    } else if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      throw new Error('confidence 字段无效')
    }
    
    return parsed as DoubaoVisionResponse
  } catch (error: any) {
    if (error.message.includes('JSON')) {
      throw new Error(`解析返回结果失败: ${error.message}\n原始内容: ${content.substring(0, 200)}`)
    }
    throw error
  }
}
