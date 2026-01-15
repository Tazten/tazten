/**
 * Google Analytics 工具函数
 * 用于追踪用户行为
 */

// 声明 gtag 函数类型
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        [key: string]: any
      }
    ) => void
    dataLayer: any[]
  }
}

/**
 * 初始化 Google Analytics
 */
export const initGA = (measurementId: string) => {
  if (typeof window === 'undefined') return

  // 加载 gtag.js
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script1)

  // 初始化 dataLayer 和 gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag as any

  gtag('js', new Date())
  gtag('config', measurementId)
}

/**
 * 追踪自定义事件
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: any
  }
) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Analytics not initialized')
    return
  }

  window.gtag('event', eventName, eventParams)
}

/**
 * 追踪页面浏览
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window === 'undefined' || !window.gtag) {
    return
  }

  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    page_path: pagePath,
    page_title: pageTitle,
  })
}

