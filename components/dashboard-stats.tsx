export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">今月の合計時間</h3>
        <p className="text-2xl font-bold">160.5 時間</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">今週の合計時間</h3>
        <p className="text-2xl font-bold">32.0 時間</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm">今日の登録時間</h3>
        <p className="text-2xl font-bold">6.5 時間</p>
      </div>
    </div>
  )
} 