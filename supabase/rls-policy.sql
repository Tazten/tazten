-- RLS (Row Level Security) 策略配置
-- 如果遇到权限错误，执行以下 SQL

-- 1. 禁用 RLS（仅用于开发/测试，生产环境建议启用并配置策略）
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 或者

-- 2. 启用 RLS 并配置策略（推荐用于生产环境）

-- 启用 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（根据实际需求调整）
CREATE POLICY "Allow public read access" ON transactions
  FOR SELECT
  USING (true);

-- 允许所有人插入（根据实际需求调整）
CREATE POLICY "Allow public insert access" ON transactions
  FOR INSERT
  WITH CHECK (true);

-- 如果需要更新和删除权限，取消下面的注释
-- CREATE POLICY "Allow public update access" ON transactions
--   FOR UPDATE
--   USING (true);

-- CREATE POLICY "Allow public delete access" ON transactions
--   FOR DELETE
--   USING (true);

