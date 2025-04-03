"use server";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import type { CategoryData, ReceiptData, SpendingData } from "./types";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all receipts with associated items
export async function getAllReceipts(user_id: string): Promise<ReceiptData[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select(`*, items: items (*)`)
    .eq("user_id", user_id);

  if (error) throw error;
  return data as ReceiptData[];
}

export async function saveReceipt(receipt: ReceiptData & { user_id: string }) {
  await supabase.from("receipts").insert([
    {
      id: receipt.id,
      store: receipt.store,
      date: receipt.date,
      total: receipt.total,
      user_id: receipt.user_id,
    },
  ]);

  for (const item of receipt.items) {
    const itemId = uuidv4();
    await supabase.from("items").insert([
      {
        id: itemId,
        receipt_id: receipt.id,
        name: item.name,
        category: item.category,
        price: item.price,
      },
    ]);
  }
}

// Get recent receipts
export async function getRecentReceipts(
  user_id: string
): Promise<ReceiptData[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select(`*, items: items (*)`)
    .eq("user_id", user_id)
    .order("date", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as ReceiptData[];
}

// Get spending data by timeframe remains similar
export async function getSpendingData(
  timeframe: "week" | "month" | "year",
  user_id: string
): Promise<SpendingData> {
  const receipts = await getAllReceipts(user_id);
  const now = new Date();
  const filteredReceipts = receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.date);
    switch (timeframe) {
      case "week":
        return now.getTime() - receiptDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      case "month":
        return (
          receiptDate.getMonth() === now.getMonth() &&
          receiptDate.getFullYear() === now.getFullYear()
        );
      case "year":
        return receiptDate.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  });

  const categoryMap = new Map<string, number>();
  filteredReceipts.forEach((receipt) => {
    receipt.items.forEach((item) => {
      const currentAmount = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, currentAmount + item.price);
    });
  });

  const categories: CategoryData[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  return { timeframe, total, categories };
}
