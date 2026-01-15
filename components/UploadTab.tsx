'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './UploadTab.module.css'
import { getCategoryIcon } from '@/lib/categories'
import { trackEvent } from '@/lib/analytics'

const DEFAULT_IMAGE_URL = 'https://jcphhnvbridmzdcfwzar.supabase.co/storage/v1/object/public/bill-images/1768466992294-b79b4vk.png'

export default function UploadTab() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [steps, setSteps] = useState<Record<string, { status: string; duration?: number }>>({})
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（JPG、PNG 格式）')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }
    setSelectedFile(file)
    setError(null)
    setIsSuccess(false)
    setResult(null)
    
    // 追踪上传图片事件
    trackEvent('upload_image', {
      file_type: file.type,
      file_size: file.size,
      file_name: file.name.substring(0, 50), // 限制长度
    })
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = async (useDefault = false) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)
    setSteps({})
    setIsSuccess(false)

    // 追踪提交事件
    trackEvent('click_submit', {
      use_default: useDefault,
      has_file: !!selectedFile,
    })

    try {
      let response: Response
      
      if (useDefault) {
        // 使用默认图片，不走豆包API
        response = await fetch('/api/parse-and-save', {
          method: 'POST',
          headers: {
            'X-Use-Default': 'true'
          }
        })
      } else {
        // 正常流程
        if (!selectedFile) return
        
        const formData = new FormData()
        formData.append('image', selectedFile)
        
        response = await fetch('/api/parse-and-save', {
          method: 'POST',
          body: formData,
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '处理失败')
      }

      setResult(data.saved_record)
      setSteps(data.steps || {})
      setIsSuccess(true)
      
      // 追踪添加记录成功事件
      trackEvent('add_record', {
        direction: data.saved_record?.direction,
        amount: data.saved_record?.amount,
        currency: data.saved_record?.currency,
        category: data.saved_record?.category,
        confidence: data.saved_record?.confidence,
        use_default: useDefault,
      })
      
      // 清空预览
      setSelectedFile(null)
      setPreviewUrl(null)
      
      // 滚动到顶部，让用户看到成功提示
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setError(err.message || '处理失败')
      
      // 追踪失败事件
      trackEvent('submit_failed', {
        error: err.message || '未知错误',
        use_default: useDefault,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 追踪页面浏览（核心流程）
  useEffect(() => {
    trackEvent('page_view_core_flow', {
      page: 'upload',
    })
  }, [])

  return (
    <div className={styles.content}>
      {/* 成功提示 - 放在最顶部 */}
      {isSuccess && (
        <div className={styles.successSection}>
          <div className={styles.successIcon}>✅</div>
          <h2>提交成功！</h2>
          <p>账单已成功识别并保存到数据库</p>
          <div className={styles.successActions}>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                window.location.href = '/?tab=history'
              }}
            >
              查看历史记录
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => router.push(`/transactions/${result.id}`)}
            >
              查看详情
            </button>
          </div>
        </div>
      )}

      {/* 流程可视化 */}
      {!isSuccess && (
        <div className={styles.processFlow}>
          <h2>处理流程</h2>
          <div className={styles.steps}>
            {['upload', 'parse', 'validate', 'save', 'display'].map((step, index) => (
              <div key={step} className={`${styles.step} ${steps[step]?.status || ''}`}>
                <div className={styles.stepCircle}>{index + 1}</div>
                <div className={styles.stepLabel}>
                  {step === 'upload' && '上传图片'}
                  {step === 'parse' && '解析识别'}
                  {step === 'validate' && '结构化'}
                  {step === 'save' && '入库'}
                  {step === 'display' && '展示'}
                </div>
                {steps[step]?.duration && (
                  <div className={styles.stepDuration}>
                    {(steps[step].duration! / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* 处理中提示 */}
          {isProcessing && (
            <div className={styles.processingTip}>
              <div className={styles.processingIcon}>⏳</div>
              <p>AI 解析中，预计需要约 30 秒，请耐心等待...</p>
              <p className={styles.processingNote}>我们正在持续优化处理速度，后续版本将大幅缩短处理时长。</p>
            </div>
          )}
        </div>
      )}

      {/* 上传区域 */}
      {!isSuccess && !isProcessing && (
        <>
          <div className={styles.uploadSection}>
            <div 
              className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={styles.uploadIcon}>📤</div>
              <div className={styles.uploadText}>点击或拖拽上传账单图片</div>
              <div className={styles.uploadHint}>支持 JPG、PNG 格式，最大 10MB，每次仅能上传一张</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* 预览区域 - 放在默认图片上面 */}
          {previewUrl && (
            <div className={styles.previewSection}>
              <img 
                src={previewUrl} 
                alt="预览" 
                className={styles.previewImage}
                onClick={() => setFullscreenImage(previewUrl)}
              />
              <div style={{ textAlign: 'center' }}>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleSubmit(false)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '开始识别'}
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setResult(null)
                    setSteps({})
                    setIsSuccess(false)
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 默认图片预览 */}
          {!previewUrl && (
            <div className={styles.defaultImageSection}>
              <div className={styles.defaultImageDivider}>
                <span>或</span>
              </div>
              <div className={styles.defaultImageCard}>
                <div className={styles.defaultImagePreview}>
                  <img 
                    src={DEFAULT_IMAGE_URL} 
                    alt="默认图片预览" 
                    className={styles.defaultImageThumb}
                    onClick={() => setFullscreenImage(DEFAULT_IMAGE_URL)}
                  />
                  <div className={styles.defaultImageInfo}>
                    <div className={styles.defaultImageTitle}>默认示例图片</div>
                    <div className={styles.defaultImageData}>
                      <div className={styles.defaultDataItem}>
                        <span className={styles.defaultDataLabel}>类型：</span>
                        <span className={styles.defaultDataValue}>支出</span>
                      </div>
                      <div className={styles.defaultDataItem}>
                        <span className={styles.defaultDataLabel}>金额：</span>
                        <span className={styles.defaultDataValue}>CNY 14.73</span>
                      </div>
                      <div className={styles.defaultDataItem}>
                        <span className={styles.defaultDataLabel}>商户：</span>
                        <span className={styles.defaultDataValue}>快车 张师傅</span>
                      </div>
                      <div className={styles.defaultDataItem}>
                        <span className={styles.defaultDataLabel}>分类：</span>
                        <span className={styles.defaultDataValue}>🚇 出行 / 交通</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className={styles.btnDefault}
                  onClick={() => handleSubmit(true)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '使用默认图片体验流程'}
                </button>
                <p className={styles.defaultImageHint}>
                  将跳过 AI 识别，直接使用预设数据入库
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* 全屏预览 */}
      {fullscreenImage && (
        <div 
          className={styles.previewImageFullscreen}
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="全屏预览" />
        </div>
      )}

      {/* 错误提示 */}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}
