export interface ReceiptItem {
  name: string
  price: number
  category: string
}

export interface ReceiptData {
  id: string
  date: string
  store: string
  total: number
  items: ReceiptItem[]
}

export interface CategoryData {
  category: string
  amount: number
}

export interface SpendingData {
  timeframe: "week" | "month" | "year"
  total: number
  categories: CategoryData[]
}

export interface ProcessedReceipt {
  items: ReceiptItem[]
  store: string
  date: string
  total: number
}

