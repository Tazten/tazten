'use client'

import { useState, useEffect } from 'react'
import UploadTab from '@/components/UploadTab'
import HistoryTab from '@/components/HistoryTab'
import styles from './page.module.css'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload')

  useEffect(() => {
    // 检查 URL 参数
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'history') {
        setActiveTab('history')
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h1>📱 无感记账</h1>
          <div className={styles.headerSubtitle}>AI 智能识别账单，自动记录每一笔消费</div>
        </div>
        
        <div className={styles.headerMeta}>
          <div className={styles.headerAuthor}>
            <span className={styles.metaLabel}>开发者</span>
            <span className={styles.metaValue}>Tazten</span>
          </div>
        </div>

        <div className={styles.headerDescription}>
          <p>本系统仅用于第二次作业展示，后续产品开发将使用 iPhone 快捷指令对接。Web 上传功能仅为更好地展示作业要求。</p>
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🤖</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>模型：</span>
              <span className={styles.infoValue}>Doubao-Seed-1.6-Flash</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>💳</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>额度：</span>
              <span className={styles.infoValue}>每日 150万 token 免费</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>✨</span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>体验：</span>
              <span className={styles.infoValue}>欢迎上传账单图片体验 AI 识别功能</span>
            </div>
          </div>
          <div className={styles.privacyWarning}>
            上传内容对所有用户可见，请勿上传隐私信息
          </div>
        </div>
      </div>

      {/* 路径栏/标签页 */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          上传账单
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史记录
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === 'upload' && <UploadTab />}
      {activeTab === 'history' && <HistoryTab />}
    </div>
  )
}
