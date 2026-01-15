'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Transaction } from '@/lib/types'
import { getCategoryIcon } from '@/lib/categories'
import Link from 'next/link'
import styles from './detail.module.css'

export default function TransactionDetail() {
  const params = useParams()
  const id = params.id as string
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullscreenImage, setFullscreenImage] = useState(false)

  useEffect(() => {
    if (id) {
      loadTransaction(id)
    }
  }, [id])

  const loadTransaction = async (transactionId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()

      if (error) throw error
      setTransaction(data)
    } catch (err) {
      console.error('加载交易详情失败:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>加载中...</div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>未找到该交易记录</div>
          <Link href="/" className={styles.btn}>← 返回列表</Link>
        </div>
      </div>
    )
  }

  const jsonData = {
    direction: transaction.direction,
    amount: transaction.amount,
    currency: transaction.currency,
    occurred_at: transaction.occurred_at,
    merchant: transaction.merchant,
    category: transaction.category,
    subcategory: transaction.subcategory,
    note: transaction.note,
    confidence: transaction.confidence,
    raw_text: transaction.raw_text
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📄 交易详情</h1>
        <Link href="/" className={styles.btn}>← 返回列表</Link>
      </div>

      <div className={styles.content}>
        {/* 图片区域 */}
        <div className={styles.imageSection}>
          <h2>原始账单图片</h2>
          <img 
            src={transaction.image_url} 
            alt="账单图片" 
            className={styles.billImage}
            onClick={() => setFullscreenImage(true)}
          />
          {fullscreenImage && (
            <div 
              className={styles.billImageFullscreen}
              onClick={() => setFullscreenImage(false)}
            >
              <img src={transaction.image_url} alt="全屏预览" />
            </div>
          )}
        </div>

        {/* 详情网格 */}
        <div className={styles.detailGrid}>
          <div className={styles.detailSection}>
            <h2>基本信息</h2>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>类型</div>
              <div className={`${styles.detailValue} ${transaction.direction === 'expense' ? styles.expense : styles.income}`}>
                {transaction.direction === 'expense' ? '支出' : '收入'}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>金额</div>
              <div className={`${styles.detailValue} ${styles.amount} ${transaction.direction === 'expense' ? styles.expense : styles.income}`}>
                {transaction.currency} {transaction.amount.toFixed(2)}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>商户</div>
              <div className={styles.detailValue}>{transaction.merchant || '未识别'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>时间</div>
              <div className={styles.detailValue}>
                {transaction.occurred_at ? new Date(transaction.occurred_at).toLocaleString('zh-CN') : '未识别'}
              </div>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h2>分类信息</h2>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>一级分类</div>
              <div className={styles.detailValue}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>
                  {getCategoryIcon(transaction.category, transaction.subcategory, transaction.direction)}
                </span>
                {transaction.category || '未分类'}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>二级分类</div>
              <div className={styles.detailValue}>{transaction.subcategory || '未分类'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>备注</div>
              <div className={styles.detailValue}>{transaction.note || '无'}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>置信度</div>
              <div className={styles.detailValue}>{(transaction.confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* 原始文本 */}
        <div className={styles.detailSection}>
          <h2>识别文本</h2>
          <div className={styles.rawText}>{transaction.raw_text || '无'}</div>
        </div>

        {/* JSON 数据 */}
        <div className={styles.jsonSection}>
          <h2>完整 JSON 数据（大模型返回）</h2>
          <div className={styles.jsonContent}>
            <pre>{JSON.stringify(jsonData, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

