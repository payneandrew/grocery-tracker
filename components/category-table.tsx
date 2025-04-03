import type { CategoryData } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CategoryTableProps {
  data: CategoryData[]
}

export function CategoryTable({ data }: CategoryTableProps) {
  // Calculate total amount
  const totalAmount = data.reduce((sum, category) => sum + category.amount, 0)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((category) => (
            <TableRow key={category.category}>
              <TableCell className="font-medium">{category.category}</TableCell>
              <TableCell className="text-right">${category.amount.toFixed(2)}</TableCell>
              <TableCell className="text-right">{((category.amount / totalAmount) * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">${totalAmount.toFixed(2)}</TableCell>
            <TableCell className="text-right">100%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

