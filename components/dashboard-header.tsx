import { ShoppingCart } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-emerald-600" />
        <h1 className="text-2xl font-bold tracking-tight">Grocery Breakdown</h1>
      </div>
      <p className="text-muted-foreground">Track and analyze your grocery spending by category</p>
    </div>
  )
}

