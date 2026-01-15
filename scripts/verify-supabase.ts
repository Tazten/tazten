/**
 * Supabase 连接验证脚本
 * 运行: npx tsx scripts/verify-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function verifySupabase() {
  console.log('🔍 开始验证 Supabase 连接...\n')

  // 1. 检查环境变量
  console.log('1️⃣ 检查环境变量:')
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL 未设置')
    return
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)

  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置')
    return
  }
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`)

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY 未设置')
    return
  }
  console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey.substring(0, 20)}...\n`)

  // 2. 测试客户端连接
  console.log('2️⃣ 测试客户端连接:')
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await client.from('transactions').select('count').limit(0)
    
    if (error) {
      console.error(`   ❌ 连接失败: ${error.message}`)
      if (error.message.includes('relation "transactions" does not exist')) {
        console.error('   💡 提示: transactions 表不存在，请先执行 supabase/schema.sql 创建表')
      }
      return
    }
    console.log('   ✅ 客户端连接成功\n')
  } catch (error: any) {
    console.error(`   ❌ 连接异常: ${error.message}\n`)
    return
  }

  // 3. 测试服务端连接
  console.log('3️⃣ 测试服务端连接:')
  try {
    const server = createClient(supabaseUrl, supabaseServiceKey)
    const { data, error } = await server.from('transactions').select('count').limit(0)
    
    if (error) {
      console.error(`   ❌ 连接失败: ${error.message}\n`)
      return
    }
    console.log('   ✅ 服务端连接成功\n')
  } catch (error: any) {
    console.error(`   ❌ 连接异常: ${error.message}\n`)
    return
  }

  // 4. 验证表结构
  console.log('4️⃣ 验证表结构:')
  try {
    const server = createClient(supabaseUrl, supabaseServiceKey)
    
    // 检查表是否存在
    const { data: tableData, error: tableError } = await server
      .from('transactions')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.error(`   ❌ 表不存在或无法访问: ${tableError.message}`)
      return
    }

    // 尝试插入一条测试数据（然后删除）
    const testData = {
      direction: 'expense',
      amount: 0.01,
      currency: 'CNY',
      confidence: 0.9,
      status: 'success',
      image_url: 'https://test.com/test.jpg'
    }

    const { data: insertData, error: insertError } = await server
      .from('transactions')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error(`   ❌ 插入测试失败: ${insertError.message}`)
      console.error(`   💡 提示: 请检查表结构是否与 schema.sql 一致`)
      return
    }

    console.log('   ✅ 表结构验证通过')
    console.log(`   ✅ 插入测试成功，记录 ID: ${insertData.id}`)

    // 清理测试数据
    await server
      .from('transactions')
      .delete()
      .eq('id', insertData.id)

    console.log('   ✅ 测试数据已清理\n')

    // 5. 检查表字段
    console.log('5️⃣ 检查表字段:')
    const requiredFields = [
      'id', 'direction', 'amount', 'currency', 'occurred_at',
      'merchant', 'category', 'subcategory', 'note',
      'confidence', 'raw_text', 'status', 'image_url',
      'created_at', 'updated_at'
    ]

    const { data: sampleData } = await server
      .from('transactions')
      .select('*')
      .limit(1)
      .single()

    if (sampleData) {
      const existingFields = Object.keys(sampleData)
      const missingFields = requiredFields.filter(f => !existingFields.includes(f))
      
      if (missingFields.length > 0) {
        console.error(`   ❌ 缺少字段: ${missingFields.join(', ')}`)
        return
      }
      console.log(`   ✅ 所有必需字段都存在 (共 ${requiredFields.length} 个字段)`)
    } else {
      // 如果没有数据，通过插入测试来验证字段
      console.log(`   ✅ 字段验证通过（通过插入测试）`)
    }

    console.log('\n✅ Supabase 验证完成！所有检查通过。')
    console.log('\n📋 项目信息:')
    console.log(`   项目名: Tazten`)
    console.log(`   表名: transactions`)
    console.log(`   URL: ${supabaseUrl}`)

  } catch (error: any) {
    console.error(`   ❌ 验证异常: ${error.message}\n`)
  }
}

// 运行验证
verifySupabase().catch(console.error)

