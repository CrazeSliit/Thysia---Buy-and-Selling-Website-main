interface SalesChartProps {
  userId: string
}

export default async function SalesChart({ userId }: SalesChartProps) {
  // This is a placeholder component for the sales chart
  // In a real implementation, you would fetch sales data and use a charting library like Chart.js or Recharts
  
  const mockData = [
    { month: 'Jan', sales: 1200 },
    { month: 'Feb', sales: 1900 },
    { month: 'Mar', sales: 800 },
    { month: 'Apr', sales: 2400 },
    { month: 'May', sales: 1800 },
    { month: 'Jun', sales: 2200 },
  ]

  const maxSales = Math.max(...mockData.map(d => d.sales))

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Simple bar chart representation */}
        <div className="flex items-end space-x-2 h-48">
          {mockData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary-500 rounded-t"
                style={{ 
                  height: `${(data.sales / maxSales) * 100}%`,
                  minHeight: '20px'
                }}
              ></div>
              <div className="mt-2 text-xs text-secondary-600 font-medium">
                {data.month}
              </div>
              <div className="text-xs text-secondary-500">
                ${data.sales}
              </div>
            </div>
          ))}
        </div>
        
        {/* Chart summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Total Sales (6 months)</span>
            <span className="font-medium text-secondary-900">
              ${mockData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-secondary-600">Average Monthly Sales</span>
            <span className="font-medium text-secondary-900">
              ${Math.round(mockData.reduce((sum, d) => sum + d.sales, 0) / mockData.length).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Note about real implementation */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            📊 <strong>Note:</strong> This is a placeholder chart. In production, this would be replaced with a proper charting library like Chart.js or Recharts with real sales data.
          </p>
        </div>
      </div>
    </div>
  )
}
