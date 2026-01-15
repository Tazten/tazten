'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Transaction } from '@/lib/types'
import { getCategoryIcon } from '@/lib/categories'
import styles from './HistoryTab.module.css'
import Link from 'next/link'

export default function HistoryTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase 错误:', error)
        throw new Error(`加载失败: ${error.message}`)
      }
      setTransactions(data || [])
    } catch (err: any) {
      console.error('加载交易记录失败:', err)
      // 显示用户友好的错误信息
      alert(`加载失败: ${err.message || '未知错误'}\n\n请检查：\n1. Supabase 环境变量是否正确\n2. RLS 策略是否已配置\n3. transactions 表是否存在`)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.direction === filter)

  const stats = {
    total: transactions.length,
    expense: transactions.filter(tx => tx.direction === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    income: transactions.filter(tx => tx.direction === 'income').reduce((sum, tx) => sum + tx.amount, 0),
  }

  if (loading) {
    return <div className={styles.content}>加载中...</div>
  }

  return (
    <div className={styles.content}>
      {/* 统计卡片 */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总记录数</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总支出</div>
          <div className={styles.statValue}>¥{stats.expense.toFixed(2)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总收入</div>
          <div className={styles.statValue}>¥{stats.income.toFixed(2)}</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'expense' ? styles.active : ''}`}
          onClick={() => setFilter('expense')}
        >
          支出
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'income' ? styles.active : ''}`}
          onClick={() => setFilter('income')}
        >
          收入
        </button>
      </div>

      {/* 交易列表 */}
      <div className={styles.transactionList}>
        {filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📭</div>
            <div className={styles.emptyStateText}>暂无交易记录</div>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <Link key={tx.id} href={`/transactions/${tx.id}`} className={styles.transactionCard}>
              <div className={styles.transactionHeader}>
                <div className={styles.transactionMain}>
                  <div className={`${styles.transactionIcon} ${tx.direction === 'expense' ? styles.expense : styles.income}`}>
                    {getCategoryIcon(tx.category, tx.subcategory, tx.direction)}
                  </div>
                  <div className={styles.transactionInfo}>
                    <div className={styles.transactionMerchant}>{tx.merchant || '未识别商户'}</div>
                    <div className={styles.transactionMeta}>
                      <span>{tx.direction === 'expense' ? '支出' : '收入'}</span>
                      <span>{new Date(tx.created_at).toLocaleString('zh-CN')}</span>
                      {tx.category && <span>{tx.category}{tx.subcategory ? ` / ${tx.subcategory}` : ''}</span>}
                    </div>
                    {tx.category && (
                      <div className={styles.transactionTags}>
                        <span className={styles.tag}>{tx.category}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`${styles.transactionAmount} ${tx.direction === 'expense' ? styles.expense : styles.income}`}>
                  {tx.direction === 'expense' ? '-' : '+'}{tx.currency} {tx.amount.toFixed(2)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

