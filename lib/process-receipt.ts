"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { saveReceipt } from "./data";
import { googleClient } from "./google-client";
import type { ProcessedReceipt } from "./types";

export async function processReceipt(
  formData: FormData
): Promise<ProcessedReceipt> {
  try {
    // Get the receipt file from the form data
    const file = formData.get("receipt") as File;

    if (!file) {
      throw new Error("No receipt file provided");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const [result] = await googleClient.textDetection(buffer);
    const detections = result.textAnnotations;
    const ocrText =
      detections && detections[0] ? detections[0].description : "no text found";

    console.log("OCR extracted text:", ocrText);

    const receiptSchema = z.object({
      store: z.string(),
      date: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          category: z.string(),
          price: z.number(),
        })
      ),
      total: z.number(),
    });

    // Use AI to extract and categorize items from the receipt
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      prompt: `
      You are an AI assistant that processes real grocery receipts.

    Extract and structure the following from this raw receipt text:

    \`\`\`
    ${ocrText}
    \`\`\`

     Ensure the store name is clearly formatted, removing unnecessary abbreviations, extra numbers, special characters, or unclear wording. Ensure each grocery item's name is clearly formatted, removing unnecessary abbreviations, extra numbers, special characters, or unclear wording. Assign each item a detailed and contextually appropriate category based on the receipt content.
  `,
      schema: receiptSchema,
      temperature: 0.2,
    });

    const receiptData = object;

    // Save the receipt to our data store
    const user_id = formData.get("user_id") as string;
    await saveReceipt({
      id: uuidv4(),
      user_id,
      ...receiptData,
    });

    // Revalidate the home page to show the new data
    revalidatePath("/");

    return receiptData;
  } catch (error) {
    console.error("Error processing receipt:", error);
    throw new Error("Failed to process receipt");
  }
}
