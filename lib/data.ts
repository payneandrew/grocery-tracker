"use server";

import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { CategoryData, ReceiptData, SpendingData } from "./types";

// In a real application, you would use a database
// For this example, we'll use a JSON file to store the data
// const DATA_FILE = path.join(process.cwd(), "data", "receipts.json")
const DATA_FILE = path.join(os.tmpdir(), "receipts.json");

// Initialize the data file if it doesn't exist
async function initDataFile() {
  try {
    // Create the data directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });

    // Check if the file exists
    try {
      await fs.access(DATA_FILE);
    } catch {
      // If the file doesn't exist, create it with an empty array
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error initializing data file:", error);
  }
}

// Get all receipts
export async function getAllReceipts(): Promise<ReceiptData[]> {
  await initDataFile();

  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading receipts:", error);
    return [];
  }
}

// Get recent receipts (last 10)
export async function getRecentReceipts(): Promise<ReceiptData[]> {
  const receipts = await getAllReceipts();
  return receipts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

// Save a new receipt
export async function saveReceipt(receipt: ReceiptData): Promise<void> {
  await initDataFile();

  try {
    const receipts = await getAllReceipts();
    receipts.push(receipt);
    await fs.writeFile(DATA_FILE, JSON.stringify(receipts, null, 2));
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw new Error("Failed to save receipt");
  }
}

// Get spending data by timeframe
export async function getSpendingData(
  timeframe: "week" | "month" | "year"
): Promise<SpendingData> {
  const receipts = await getAllReceipts();

  // Filter receipts by timeframe
  const now = new Date();
  const filteredReceipts = receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.date);

    switch (timeframe) {
      case "week":
        // Last 7 days
        return now.getTime() - receiptDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
      case "month":
        // Current month
        return (
          receiptDate.getMonth() === now.getMonth() &&
          receiptDate.getFullYear() === now.getFullYear()
        );
      case "year":
        // Current year
        return receiptDate.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  });

  // Calculate spending by category
  const categoryMap = new Map<string, number>();

  filteredReceipts.forEach((receipt) => {
    receipt.items.forEach((item) => {
      const currentAmount = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, currentAmount + item.price);
    });
  });

  // Convert to array and sort by amount
  const categories: CategoryData[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate total
  const total = categories.reduce((sum, category) => sum + category.amount, 0);

  return {
    timeframe,
    total,
    categories,
  };
}
