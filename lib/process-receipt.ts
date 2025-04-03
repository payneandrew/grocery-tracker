"use server";

import { openai } from "@ai-sdk/openai";
import vision from "@google-cloud/vision";
import { generateObject } from "ai";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { saveReceipt } from "./data";
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

    const client = new vision.ImageAnnotatorClient();

    // Perform text detection on the image buffer
    const [result] = await client.textDetection(buffer);
    const detections = result.textAnnotations;
    const ocrText =
      detections && detections[0] ? detections[0].description : "";

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

    Assign each item a detailed and contextually appropriate category based on the receipt content.
  `,
      schema: receiptSchema,
      temperature: 0.2,
    });

    const receiptData = object;

    // Save the receipt to our data store
    await saveReceipt({
      id: uuidv4(),
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
