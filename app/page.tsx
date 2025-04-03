import { DashboardHeader } from "@/components/dashboard-header";
import { ReceiptUploader } from "@/components/receipt-uploader";
import { RecentReceipts } from "@/components/recent-receipts";
import { SpendingOverview } from "@/components/spending-overview";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <SpendingOverview />
        </div>
        <div>
          <ReceiptUploader />
        </div>
      </div>
      <div className="mt-8">
        <RecentReceipts />
      </div>
    </main>
  );
}
