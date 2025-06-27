'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function EarningsChart() {
  // Mock data for now
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 800 },
    { name: 'Apr', value: 900 },
    { name: 'May', value: 1200 },
    { name: 'Jun', value: 1100 },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Monthly Earnings
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$2,350</div>
        <p className="text-xs text-muted-foreground">
          +20.1% from last month
        </p>
        
        {/* Simple bar chart representation */}
        <div className="mt-4 space-y-2">
          {mockData.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div className="w-8 text-sm text-muted-foreground">{item.name}</div>
              <div className="flex-1 bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${(item.value / 1200) * 100}%` }}
                />
              </div>
              <div className="text-sm font-medium">${item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
