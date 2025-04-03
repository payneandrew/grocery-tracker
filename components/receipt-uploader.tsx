"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserId } from "@/lib/get-user-id";
import { processReceipt } from "@/lib/process-receipt";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

export function ReceiptUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("user_id", getUserId());

      // Process the receipt
      const result = await processReceipt(formData);

      // Show success message
      toast({
        title: "Receipt processed successfully",
        description: `${result.items.length} items categorized`,
      });

      // Reset the file input
      setFile(null);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast({
        title: "Error processing receipt",
        description: "Please try again with a clearer image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Receipt</CardTitle>
        <CardDescription>
          Upload your grocery receipt to track spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 mb-4">
            {file ? file.name : "Drag and drop or click to upload"}
          </p>
          <input
            type="file"
            id="receipt"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="receipt">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Select File</span>
            </Button>
          </label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Receipt"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
