-- 创建 transactions 表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 核心账务字段（来自解析结果）
  direction TEXT NOT NULL CHECK (direction IN ('expense', 'income')),
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  occurred_at TIMESTAMPTZ,
  merchant TEXT,
  category TEXT,
  subcategory TEXT,
  note TEXT,
  
  -- 识别相关
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  raw_text TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'needs_review', 'failed')),
  
  -- 溯源字段
  image_url TEXT NOT NULL,  -- TOS 或 Supabase Storage 的公开 URL
  
  -- 元数据
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_direction ON transactions(direction);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建 Storage Bucket（需要在 Supabase 控制台手动创建，这里只是说明）
-- Bucket 名称: bill-images
-- 公开访问: 是

