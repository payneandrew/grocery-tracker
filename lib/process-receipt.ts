"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import type { ProcessedReceipt } from "./types"
import { saveReceipt } from "./data"

export async function processReceipt(formData: FormData): Promise<ProcessedReceipt> {
  try {
    // Get the receipt file from the form data
    const file = formData.get("receipt") as File

    if (!file) {
      throw new Error("No receipt file provided")
    }

    // In a real application, you would use OCR to extract text from the receipt image
    // For this example, we'll simulate OCR by using AI to generate receipt data

    // Convert the file to a base64 string (in a real app, you'd use OCR here)
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    // Use AI to extract and categorize items from the receipt
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        You are an AI assistant that processes grocery receipts. 
        I have a grocery receipt image. Please generate realistic grocery receipt data with the following:
        
        1. Store name
        2. Date (use today's date)
        3. A list of 5-10 grocery items with:
           - Item name
           - Price
           - Category (must be one of: Produce, Meat & Seafood, Dairy, Bakery, Pantry, Frozen, Beverages, Snacks, Household, Personal Care)
        4. Total amount
        
        Format your response as a JSON object with this structure:
        {
          "store": "Store Name",
          "date": "YYYY-MM-DD",
          "items": [
            {
              "name": "Item Name",
              "price": 0.00,
              "category": "Category"
            }
          ],
          "total": 0.00
        }
        
        Make sure the prices are realistic and the total is the sum of all item prices.
      `,
    })

    // Parse the AI-generated receipt data
    const receiptData = JSON.parse(text) as ProcessedReceipt

    // Save the receipt to our data store
    await saveReceipt({
      id: uuidv4(),
      ...receiptData,
    })

    // Revalidate the home page to show the new data
    revalidatePath("/")

    return receiptData
  } catch (error) {
    console.error("Error processing receipt:", error)
    throw new Error("Failed to process receipt")
  }
}

