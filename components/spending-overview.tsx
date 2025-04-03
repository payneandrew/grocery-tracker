"use client";

import { CategoryChart } from "@/components/category-chart";
import { CategoryTable } from "@/components/category-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSpendingData } from "@/lib/data";
import { getUserId } from "@/lib/get-user-id";
import type { SpendingData } from "@/lib/types";
import { useEffect, useState } from "react";

export function SpendingOverview() {
  const [spendingData, setSpendingData] = useState<SpendingData | null>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month"
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getSpendingData(timeframe, getUserId());
        setSpendingData(data);
      } catch (error) {
        console.error("Error fetching spending data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Overview</CardTitle>
        <CardDescription>
          View your grocery spending by category
        </CardDescription>
        <Tabs
          defaultValue="month"
          className="w-full"
          onValueChange={(value) => setTimeframe(value as any)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : spendingData && spendingData.categories.length > 0 ? (
          <div className="space-y-8">
            <CategoryChart data={spendingData.categories} />
            <CategoryTable data={spendingData.categories} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No spending data available. Upload a receipt to get started!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
