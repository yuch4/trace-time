import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEntries } from "@/components/recent-entries"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>
      <DashboardStats />
      <RecentEntries />
    </div>
  )
}