import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToSupabase, generateObjectKey } from '@/lib/supabase/storage'
import { parseBillImage } from '@/lib/doubao/vision'
import { supabaseServer } from '@/lib/supabase/server'
import { validateCategory } from '@/lib/categories'
import type { ParseAndSaveResponse, Transaction } from '@/lib/types'

/**
 * POST /api/parse-and-save
 * 接收图片，上传到 Supabase Storage，调用豆包 API 解析，保存到 Supabase
 */
const DEFAULT_IMAGE_URL = 'https://jcphhnvbridmzdcfwzar.supabase.co/storage/v1/object/public/bill-images/1768466992294-b79b4vk.png'

const DEFAULT_TRANSACTION_DATA = {
  direction: 'expense' as const,
  amount: 14.73,
  currency: 'CNY',
  occurred_at: '2026-01-06T00:00:00+00:00',
  merchant: '快车 张师傅',
  category: '出行',
  subcategory: '交通',
  note: '快车 京LN（部分隐藏） 张师傅',
  confidence: 0.9,
  raw_text: '快车 京LN（部分隐藏） 张师傅\n2026年01月06日\n行程费用 24.73元\n优惠券 -10.00元\n实付14.73元 已优惠10.00元'
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const steps: ParseAndSaveResponse['steps'] = {}

  try {
    // 检查环境变量
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: 'Supabase 环境变量未配置',
          step: 'upload',
          steps: {}
        },
        { status: 500 }
      )
    }

    // 检查是否使用默认图片
    const useDefault = request.headers.get('X-Use-Default') === 'true'
    
    let imageUrl: string
    let parseResult: any

    if (useDefault) {
      // 使用默认图片，跳过上传和解析步骤
      console.log('📋 使用默认图片，跳过 AI 识别')
      imageUrl = DEFAULT_IMAGE_URL
      parseResult = DEFAULT_TRANSACTION_DATA
      
      steps.upload = {
        status: 'success',
        duration: 0
      }
      steps.parse = {
        status: 'success',
        duration: 0
      }
    } else {
      // 正常流程：检查豆包 API Key
      if (!process.env.ARK_API_KEY && !process.env.DOUBAO_API_KEY) {
        return NextResponse.json(
          {
            status: 'failed' as const,
            error: '豆包 API Key 未配置（需要 ARK_API_KEY 或 DOUBAO_API_KEY）',
            step: 'parse',
            steps: {}
          },
          { status: 500 }
        )
      }

      // 步骤1: 接收并上传图片
      const formData = await request.formData()
      const file = formData.get('image') as File

      if (!file) {
        return NextResponse.json(
          {
            status: 'failed' as const,
            error: '未提供图片文件',
            step: 'upload',
            steps: {}
          },
          { status: 400 }
        )
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            status: 'failed' as const,
            error: '文件必须是图片格式',
            step: 'upload',
            steps: {}
          },
          { status: 400 }
        )
      }

      // 上传到 Supabase Storage
      const step1Start = Date.now()
      try {
        const fileName = generateObjectKey(file.name)
        const result = await uploadImageToSupabase(file, fileName)
        imageUrl = result.url
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ 图片上传成功:', imageUrl)
        }
        steps.upload = {
          status: 'success',
          duration: Date.now() - step1Start
        }
      } catch (error: any) {
        console.error('❌ 图片上传失败:', error)
        console.error('错误详情:', error.message)
        console.error('错误堆栈:', error.stack)
        steps.upload = {
          status: 'failed',
          duration: Date.now() - step1Start,
          error: error.message
        }
        return NextResponse.json(
          {
            status: 'failed' as const,
            error: `图片上传失败: ${error.message}`,
            step: 'upload',
            steps
          },
          { status: 500 }
        )
      }

      // 步骤2: 调用豆包 API 解析
      const step2Start = Date.now()
      try {
        parseResult = await parseBillImage(imageUrl)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ 豆包 API 解析成功')
        }
        steps.parse = {
          status: 'success',
          duration: Date.now() - step2Start
        }
      } catch (error: any) {
        console.error('❌ 豆包 API 调用失败:', error)
        console.error('错误详情:', error.message)
        console.error('错误堆栈:', error.stack)
        steps.parse = {
          status: 'failed',
          duration: Date.now() - step2Start,
          error: error.message
        }
        return NextResponse.json(
          {
            status: 'failed' as const,
            error: `图片解析失败: ${error.message}`,
            step: 'parse',
            steps
          },
          { status: 500 }
        )
      }
    }

    // 步骤3: 验证数据
    const step3Start = Date.now()
    const validationErrors: string[] = []

    if (!parseResult.direction || !['expense', 'income'].includes(parseResult.direction)) {
      validationErrors.push('direction 字段无效或缺失')
    }
    if (typeof parseResult.amount !== 'number' || parseResult.amount <= 0) {
      validationErrors.push('amount 字段无效或缺失')
    }
    if (!parseResult.currency) {
      validationErrors.push('currency 字段缺失')
    }
    if (typeof parseResult.confidence !== 'number' || parseResult.confidence < 0 || parseResult.confidence > 1) {
      validationErrors.push('confidence 字段无效或缺失')
    }
    
    // 验证分类是否有效
    if (parseResult.category && !validateCategory(parseResult.category, parseResult.subcategory, parseResult.direction)) {
      validationErrors.push(`分类无效: ${parseResult.category}${parseResult.subcategory ? ` / ${parseResult.subcategory}` : ''}`)
    }

    if (validationErrors.length > 0) {
      steps.validate = {
        status: 'failed',
        duration: Date.now() - step3Start,
        error: validationErrors.join('; ')
      }
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: `数据验证失败: ${validationErrors.join('; ')}`,
          step: 'validate',
          steps
        },
        { status: 400 }
      )
    }

    steps.validate = {
      status: 'success',
      duration: Date.now() - step3Start
    }

    // 计算状态（根据置信度）
    const status = parseResult.confidence < 0.7 ? 'needs_review' : 'success'

    // 步骤4: 保存到 Supabase
    const step4Start = Date.now()
    try {
      console.log('💾 开始保存到 Supabase 数据库...')
      const insertData = {
        direction: parseResult.direction,
        amount: parseResult.amount,
        currency: parseResult.currency,
        occurred_at: parseResult.occurred_at,
        merchant: parseResult.merchant,
        category: parseResult.category,
        subcategory: parseResult.subcategory,
        note: parseResult.note,
        confidence: parseResult.confidence,
        raw_text: parseResult.raw_text,
        status,
        image_url: imageUrl
      }
      console.log('📝 插入数据:', JSON.stringify(insertData, null, 2))
      
      const { data, error } = await supabaseServer
        .from('transactions')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase 插入失败:', error)
        console.error('错误代码:', error.code)
        console.error('错误消息:', error.message)
        console.error('错误详情:', error.details)
        throw error
      }
      
      console.log('✅ 数据保存成功，记录 ID:', data.id)

      steps.save = {
        status: 'success',
        duration: Date.now() - step4Start
      }

      const savedRecord: Transaction = {
        id: data.id,
        direction: data.direction,
        amount: data.amount,
        currency: data.currency,
        occurred_at: data.occurred_at,
        merchant: data.merchant,
        category: data.category,
        subcategory: data.subcategory,
        note: data.note,
        confidence: data.confidence,
        raw_text: data.raw_text,
        status: data.status,
        image_url: data.image_url,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      return NextResponse.json({
        status,
        saved_record: savedRecord,
        steps
      } as ParseAndSaveResponse)
    } catch (error: any) {
      steps.save = {
        status: 'failed',
        duration: Date.now() - step4Start,
        error: error.message
      }
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: `保存到数据库失败: ${error.message}`,
          step: 'save',
          steps
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API 错误:', error)
    console.error('错误堆栈:', error.stack)
    
    return NextResponse.json(
      {
        status: 'failed' as const,
        error: error.message || '未知错误',
        steps,
        debug: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      },
      { status: 500 }
    )
  }
}

