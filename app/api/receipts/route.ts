import { type NextRequest, NextResponse } from "next/server"
import { getAllReceipts, saveReceipt } from "@/lib/data"
import type { ReceiptData } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const receipts = await getAllReceipts()
    return NextResponse.json(receipts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    if (!body.store || !body.date || !body.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "Invalid receipt data" }, { status: 400 })
    }

    // Create a new receipt with a unique ID
    const newReceipt: ReceiptData = {
      id: uuidv4(),
      store: body.store,
      date: body.date,
      items: body.items,
      total: body.total || body.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0),
    }

    // Save the receipt
    await saveReceipt(newReceipt)

    return NextResponse.json(newReceipt, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 })
  }
}

