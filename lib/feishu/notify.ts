/**
 * 飞书卡片消息通知
 * 当数据入库成功后，发送飞书卡片消息
 * 
 * 使用飞书 Open API 方式发送消息
 * 
 * 参考文档：
 * - Open API: https://open.feishu.cn/document/server-docs/im-v1/message/create
 * - CardKit: https://open.feishu.cn/document/cardkit-v1/feishu-card-resource-overview
 */

interface TransactionData {
  id: string
  direction: 'expense' | 'income'
  amount: number
  currency: string
  merchant: string | null
  category: string | null
  subcategory: string | null
  occurred_at: string | null
  note: string | null
  confidence: number
  created_at: string
}

/**
 * 获取飞书 Access Token（用于 Open API 方式）
 */
async function getFeishuAccessToken(): Promise<string> {
  const appId = process.env.FEISHU_APP_ID
  const appSecret = process.env.FEISHU_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('FEISHU_APP_ID 和 FEISHU_APP_SECRET 必须配置')
  }

  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`获取 Access Token 失败: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.code !== 0) {
    throw new Error(`获取 Access Token 失败: ${data.msg || '未知错误'}`)
  }

  return data.tenant_access_token
}

/**
 * 构建卡片内容（CardKit 格式）
 */
function buildCardContent(transaction: TransactionData) {
  const directionText = transaction.direction === 'expense' ? '支出' : '收入'
  const directionIcon = transaction.direction === 'expense' ? '📤' : '📥'
  const amountText = `${transaction.currency} ${transaction.amount.toFixed(2)}`
  const timeText = transaction.occurred_at
    ? new Date(transaction.occurred_at).toLocaleString('zh-CN')
    : new Date(transaction.created_at).toLocaleString('zh-CN')

  return {
    config: {
      wide_screen_mode: true,
      enable_forward: false
    },
    header: {
      title: {
        tag: 'plain_text',
        content: `${directionIcon} 新账单记录`
      },
      template: transaction.direction === 'expense' ? 'green' : 'red'
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**${directionText}** ${amountText}`
        }
      },
      {
        tag: 'hr'
      },
      {
        tag: 'div',
        fields: [
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**商户：**\n${transaction.merchant || '未识别'}`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**分类：**\n${transaction.category || '未分类'}${transaction.subcategory ? ` / ${transaction.subcategory}` : ''}`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**时间：**\n${timeText}`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**置信度：**\n${(transaction.confidence * 100).toFixed(1)}%`
            }
          }
        ]
      },
      {
        tag: 'hr'
      },
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**记录 ID：** ${transaction.id}\n**创建时间：** ${new Date(transaction.created_at).toLocaleString('zh-CN')}`
        }
      }
    ]
  }
}


/**
 * 使用 Open API 方式发送消息（官方推荐）
 * 支持直接卡片和模板卡片两种方式
 */
async function sendViaOpenAPI(
  receiveId: string,
  receiveIdType: 'chat_id' | 'open_id' | 'user_id',
  cardContent: any,
  useTemplate: boolean = false,
  transaction?: TransactionData
): Promise<void> {
  const accessToken = await getFeishuAccessToken()
  const templateId = process.env.FEISHU_TEMPLATE_ID
  const templateVersion = process.env.FEISHU_TEMPLATE_VERSION || '1.0.0'

  let content: string
  let msgType: string

  if (useTemplate && templateId && transaction) {
    // 使用模板卡片方式
    const directionText = transaction.direction === 'expense' ? '支出' : '收入'
    const directionIcon = transaction.direction === 'expense' ? '📤' : '📥'
    const amountText = `${transaction.currency} ${transaction.amount.toFixed(2)}`
    
    // 格式化时间：使用标准格式 YYYY-MM-DD HH:mm:ss
    const formatDateTime = (dateString: string | null): string => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    // 优先使用 occurred_at，如果没有则使用 created_at
    const occurredAt = transaction.occurred_at || transaction.created_at
    const occurredAtFormatted = formatDateTime(occurredAt)
    const createdAtFormatted = formatDateTime(transaction.created_at)
    
    // 根据方向选择颜色：支出用绿色，收入用红色（符合中国习惯）
    const color = transaction.direction === 'expense' ? 'green' : 'red'
    
    // 构建模板变量（变量名需要与飞书模板中的变量名一致）
    const templateVariable: Record<string, any> = {
      direction: directionText,
      direction_icon: directionIcon,
      amount: amountText,
      merchant: transaction.merchant || '未识别',
      category: transaction.category || '未分类',
      subcategory: transaction.subcategory || '',
      category_full: transaction.category 
        ? `${transaction.category}${transaction.subcategory ? ` / ${transaction.subcategory}` : ''}`
        : '未分类',
      occurred_at: occurredAtFormatted, // 标准格式：YYYY-MM-DD HH:mm:ss
      time: occurredAtFormatted, // 兼容 time 字段
      confidence: `${(transaction.confidence * 100).toFixed(1)}%`,
      record_id: transaction.id,
      created_at: createdAtFormatted, // 标准格式：YYYY-MM-DD HH:mm:ss
      note: transaction.note || '', // 备注字段
      color: color // 卡片颜色：支出=green，收入=red（符合中国习惯）
    }

    content = JSON.stringify({
      type: 'template',
      data: {
        template_id: templateId,
        template_version_name: templateVersion,
        template_variable: templateVariable
      }
    })
    msgType = 'interactive'
  } else {
    // 使用直接卡片方式
    content = JSON.stringify(cardContent)
    msgType = 'interactive'
  }

  const response = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${receiveIdType}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: msgType,
        content: content,
        // 可选：用于幂等性，防止重复发送
        uuid: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Open API 发送失败: ${response.status} - ${errorText}`)
  }

  const responseData = await response.json()
  
  // Open API 返回格式：{ code: 0, data: {...} } 表示成功
  if (responseData.code !== 0) {
    throw new Error(`Open API 返回错误: ${responseData.msg || responseData.message || JSON.stringify(responseData)}`)
  }
}

/**
 * 发送飞书卡片消息
 * 自动选择 Webhook 或 Open API 方式
 */
export async function sendFeishuNotification(transaction: TransactionData): Promise<void> {
  const receiveId = process.env.FEISHU_RECEIVE_ID
  const receiveIdType = (process.env.FEISHU_RECEIVE_ID_TYPE || 'open_id') as 'chat_id' | 'open_id' | 'user_id'
  const useTemplate = process.env.FEISHU_USE_TEMPLATE === 'true'
  const templateId = process.env.FEISHU_TEMPLATE_ID

  // 检查必需配置
  if (!receiveId) {
    console.warn('⚠️ 飞书通知未配置（需要 FEISHU_RECEIVE_ID）')
    return
  }

  // 如果使用模板但未配置模板 ID，警告
  if (useTemplate && !templateId) {
    console.warn('⚠️ 使用模板卡片需要配置 FEISHU_TEMPLATE_ID，将使用直接卡片方式')
  }

  try {
    const cardContent = buildCardContent(transaction)

    // 使用 Open API 方式发送消息
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 使用飞书 Open API 发送消息（${useTemplate && templateId ? '模板卡片' : '直接卡片'}）...`)
    }
    await sendViaOpenAPI(receiveId, receiveIdType, cardContent, useTemplate && !!templateId, transaction)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 飞书 Open API 通知发送成功')
    }
  } catch (error: any) {
    // 飞书通知失败不影响主流程，只记录错误
    console.error('❌ 发送飞书通知失败:', error.message)
    // 不抛出错误，避免影响主流程
  }
}
