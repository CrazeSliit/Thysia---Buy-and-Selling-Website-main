"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PlatformStatsProps {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    orderBreakdown: {
      pending: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
    userBreakdown: {
      buyers: number;
      sellers: number;
      drivers: number;
      admins: number;
    };
    averageOrderValue: number;
    revenueGrowth: number;
    topSellingProducts: Array<{
      id: string;
      name: string;
      price: number;
      totalSold: number;
      orderCount: number;
    }>;
  };
}

export default function PlatformStats({ stats }: PlatformStatsProps) {
  // Generate chart data from real stats
  const orderStatusData = [
    { name: 'Pending', value: stats.orderBreakdown.pending, color: '#F59E0B' },
    { name: 'Shipped', value: stats.orderBreakdown.shipped, color: '#3B82F6' },
    { name: 'Delivered', value: stats.orderBreakdown.delivered, color: '#10B981' },
    { name: 'Cancelled', value: stats.orderBreakdown.cancelled, color: '#EF4444' },
  ];

  const userRoleData = [
    { name: 'Buyers', value: stats.userBreakdown.buyers, color: '#3B82F6' },
    { name: 'Sellers', value: stats.userBreakdown.sellers, color: '#10B981' },
    { name: 'Drivers', value: stats.userBreakdown.drivers, color: '#F59E0B' },
    { name: 'Admins', value: stats.userBreakdown.admins, color: '#8B5CF6' },
  ];

  const topProductsData = stats.topSellingProducts.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    sales: product.totalSold,
    revenue: product.price * product.totalSold
  }));

  return (
    <div className="space-y-6">
      {/* Order Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-6 space-y-2">
              {orderStatusData.map((status, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {status.name}: {status.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">User Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRoleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [value, 'Users']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      {topProductsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      name === 'sales' ? `${value} sold` : `$${value?.toLocaleString()}`,
                      name === 'sales' ? 'Units Sold' : 'Revenue'
                    ]}
                  />
                  <Bar dataKey="sales" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">${stats.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Avg Order Value</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.revenueGrowth.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Revenue Growth</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.totalOrders > 0 ? ((stats.orderBreakdown.delivered / stats.totalOrders) * 100).toFixed(1) : '0'}%</p>
              <p className="text-sm text-gray-600">Delivery Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.userBreakdown.sellers}</p>
              <p className="text-sm text-gray-600">Active Sellers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
