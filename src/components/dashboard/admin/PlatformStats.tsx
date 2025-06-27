"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const salesData = [
  { month: 'Jan', revenue: 45000, orders: 1200, users: 2800 },
  { month: 'Feb', revenue: 52000, orders: 1400, users: 3200 },
  { month: 'Mar', revenue: 48000, orders: 1300, users: 3000 },
  { month: 'Apr', revenue: 61000, orders: 1600, users: 3800 },
  { month: 'May', revenue: 55000, orders: 1500, users: 3500 },
  { month: 'Jun', revenue: 67000, orders: 1800, users: 4200 },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: '#3B82F6' },
  { name: 'Fashion', value: 25, color: '#10B981' },
  { name: 'Home & Garden', value: 20, color: '#F59E0B' },
  { name: 'Sports', value: 12, color: '#EF4444' },
  { name: 'Other', value: 8, color: '#8B5CF6' },
];

const trafficData = [
  { day: 'Mon', visitors: 2400, pageViews: 4800 },
  { day: 'Tue', visitors: 2600, pageViews: 5200 },
  { day: 'Wed', visitors: 2800, pageViews: 5600 },
  { day: 'Thu', visitors: 3200, pageViews: 6400 },
  { day: 'Fri', visitors: 3600, pageViews: 7200 },
  { day: 'Sat', visitors: 4200, pageViews: 8400 },
  { day: 'Sun', visitors: 3800, pageViews: 7600 },
];

export default function PlatformStats() {
  return (
    <div className="space-y-6">
      {/* Revenue and Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue & Orders Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? `$${value?.toLocaleString()}` : value?.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="revenue" />
                <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-6 space-y-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {category.name} ({category.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Traffic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Website Traffic (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Visitors"
                />
                <Line 
                  type="monotone" 
                  dataKey="pageViews" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Page Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
