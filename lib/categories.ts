/**
 * 分类定义和图标映射
 */

export const EXPENSE_CATEGORIES = {
  饮食: {
    icon: '🍽️',
    subcategories: {
      餐饮: '🍜',
      水果: '🍎',
      零食: '🍿',
      饮料: '🥤'
    }
  },
  出行: {
    icon: '🚗',
    subcategories: {
      交通: '🚇',
      娱乐: '🎮',
      社交: '👥',
      旅行: '✈️'
    }
  },
  日用: {
    icon: '🛍️',
    subcategories: {
      日用品: '🧴',
      衣服: '👕',
      鞋包: '👠',
      配饰: '💍',
      家居用品: '🛋️'
    }
  },
  住房: {
    icon: '🏠',
    subcategories: {
      房租: '🏘️',
      水电: '💡',
      燃气: '🔥',
      网络: '📶',
      通讯: '📱'
    }
  },
  其他: {
    icon: '📦',
    subcategories: {
      理财: '💰',
      人情: '🎁',
      爱好: '🎨',
      学习: '📚',
      医疗: '🏥'
    }
  }
} as const

export const INCOME_CATEGORIES = {
  工资: '💼',
  兼职: '💻',
  理财: '📈',
  其他: '💵'
} as const

/**
 * 获取分类图标
 */
export function getCategoryIcon(category: string | null, subcategory: string | null, direction: 'expense' | 'income'): string {
  if (!category) return '📋'
  
  if (direction === 'income') {
    return INCOME_CATEGORIES[category as keyof typeof INCOME_CATEGORIES] || '💵'
  }
  
  // 支出分类
  const expenseCat = EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]
  if (!expenseCat) return '📋'
  
  // 如果有二级分类，返回二级分类图标
  if (subcategory && expenseCat.subcategories[subcategory as keyof typeof expenseCat.subcategories]) {
    return expenseCat.subcategories[subcategory as keyof typeof expenseCat.subcategories]
  }
  
  // 否则返回一级分类图标
  return expenseCat.icon
}

/**
 * 验证分类是否有效
 */
export function validateCategory(category: string | null, subcategory: string | null, direction: 'expense' | 'income'): boolean {
  if (!category) return true // 允许为空
  
  if (direction === 'income') {
    return category in INCOME_CATEGORIES
  }
  
  if (!(category in EXPENSE_CATEGORIES)) {
    return false
  }
  
  if (subcategory) {
    const expenseCat = EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]
    return subcategory in expenseCat.subcategories
  }
  
  return true
}
