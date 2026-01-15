// 交易方向
export type TransactionDirection = "expense" | "income";

// 交易状态
export type TransactionStatus = "success" | "needs_review" | "failed";

// 流程步骤状态
export type StepStatus = "pending" | "success" | "failed";

// 解析结果（来自豆包 API）
export interface ParseResult {
  direction: TransactionDirection;
  amount: number;
  currency: string;
  occurred_at: string | null;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
  note: string | null;
  confidence: number;
  raw_text: string | null;
}

// 数据库记录（Supabase）
export interface Transaction {
  id: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  occurred_at: string | null;
  merchant: string | null;
  category: string | null;
  subcategory: string | null;
  note: string | null;
  confidence: number;
  raw_text: string | null;
  status: TransactionStatus;
  image_url: string;
  created_at: string;
  updated_at: string;
}

// API 响应
export interface ParseAndSaveResponse {
  status: TransactionStatus;
  saved_record?: Transaction;
  error?: string;
  step?: "upload" | "parse" | "validate" | "save";
  steps: {
    upload?: { status: StepStatus; duration?: number; error?: string };
    parse?: { status: StepStatus; duration?: number; error?: string };
    validate?: { status: StepStatus; duration?: number; error?: string };
    save?: { status: StepStatus; duration?: number; error?: string };
  };
}

