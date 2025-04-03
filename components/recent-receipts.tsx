"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Receipt, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getRecentReceipts } from "@/lib/data"
import type { ReceiptData } from "@/lib/types"

export function RecentReceipts() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)

  useEffect(() => {
    const fetchReceipts = async () => {
      setIsLoading(true)
      try {
        const data = await getRecentReceipts()
        setReceipts(data)
      } catch (error) {
        console.error("Error fetching receipts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReceipts()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Receipts</CardTitle>
        <CardDescription>View your recently uploaded receipts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading receipts...</p>
          </div>
        ) : receipts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{format(new Date(receipt.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{receipt.store}</TableCell>
                    <TableCell className="text-right">${receipt.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{receipt.items.length}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedReceipt(receipt)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Receipt Details</DialogTitle>
                          </DialogHeader>
                          {selectedReceipt && (
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{selectedReceipt.store}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(selectedReceipt.date), "MMMM d, yyyy")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">Total</p>
                                  <p className="text-xl font-bold">${selectedReceipt.total.toFixed(2)}</p>
                                </div>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedReceipt.items.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{item.category}</TableCell>
                                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No receipts found. Upload your first receipt to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

