"use client"
import type { CategoryData } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CategoryChartProps {
  data: CategoryData[]
}

// Define colors for different categories
const COLORS = [
  "#10B981", // Emerald-500
  "#3B82F6", // Blue-500
  "#F59E0B", // Amber-500
  "#EF4444", // Red-500
  "#8B5CF6", // Violet-500
  "#EC4899", // Pink-500
  "#6366F1", // Indigo-500
  "#14B8A6", // Teal-500
  "#F97316", // Orange-500
  "#84CC16", // Lime-500
]

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center">No data available</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
            nameKey="category"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

