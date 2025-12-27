export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-muted-foreground">Today Collection</p>
          <p className="text-2xl font-bold">₹25,000</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold">450</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-muted-foreground">Due Fees</p>
          <p className="text-2xl font-bold text-red-500">₹1,20,000</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-muted-foreground">This Month Expense</p>
          <p className="text-2xl font-bold">₹80,000</p>
        </div>
      </div>
    </div>
  );
}
