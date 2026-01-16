/**
 * 测试飞书通知功能
 * 运行: npm run test:feishu
 */

// 加载环境变量
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

import { sendFeishuNotification } from '../lib/feishu/notify'

// 模拟一条交易数据
const testTransaction = {
  id: 'test-' + Date.now(),
  direction: 'expense' as const,
  amount: 14.73,
  currency: 'CNY',
  merchant: '快车',
  category: '出行',
  subcategory: '交通',
  occurred_at: new Date().toISOString(),
  note: '快车行程费用，实付14.73元，已优惠10元',
  confidence: 0.9,
  created_at: new Date().toISOString()
}

async function test() {
  console.log('🧪 开始测试飞书通知功能...')
  console.log('📝 测试数据:', JSON.stringify(testTransaction, null, 2))
  console.log('')

  try {
    await sendFeishuNotification(testTransaction)
    console.log('')
    console.log('✅ 测试完成！请检查飞书是否收到消息')
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

test()
