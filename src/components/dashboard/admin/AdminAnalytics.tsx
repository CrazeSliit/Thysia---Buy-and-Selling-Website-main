"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Eye,
  Mouse,
  Smartphone,
  Monitor,
  Calendar,
  Globe
} from "lucide-react";

// Mock data for different analytics
const salesData = [
  { month: 'Jan', revenue: 45000, orders: 1200, users: 2800, conversion: 2.3 },
  { month: 'Feb', revenue: 52000, orders: 1400, users: 3200, conversion: 2.8 },
  { month: 'Mar', revenue: 48000, orders: 1300, users: 3000, conversion: 2.6 },
  { month: 'Apr', revenue: 61000, orders: 1600, users: 3800, conversion: 3.1 },
  { month: 'May', revenue: 55000, orders: 1500, users: 3500, conversion: 2.9 },
  { month: 'Jun', revenue: 67000, orders: 1800, users: 4200, conversion: 3.4 },
];

const deviceData = [
  { name: 'Desktop', value: 45, color: '#3B82F6' },
  { name: 'Mobile', value: 35, color: '#10B981' },
  { name: 'Tablet', value: 20, color: '#F59E0B' },
];

const topProducts = [
  { name: 'Premium Headphones', sales: 1250, revenue: 62500, growth: 15 },
  { name: 'Smart Watch', sales: 980, revenue: 147000, growth: 22 },
  { name: 'Laptop Stand', sales: 750, revenue: 22500, growth: -5 },
  { name: 'Wireless Mouse', sales: 650, revenue: 19500, growth: 8 },
  { name: 'USB-C Hub', sales: 580, revenue: 34800, growth: 12 },
];

const trafficSources = [
  { source: 'Organic Search', visitors: 8420, percentage: 42 },
  { source: 'Direct', visitors: 5680, percentage: 28 },
  { source: 'Social Media', visitors: 3200, percentage: 16 },
  { source: 'Email', visitors: 1890, percentage: 9 },
  { source: 'Referral', visitors: 1010, percentage: 5 },
];

const userBehaviorData = [
  { day: 'Mon', pageViews: 8420, sessions: 2840, bounceRate: 35 },
  { day: 'Tue', pageViews: 9650, sessions: 3120, bounceRate: 32 },
  { day: 'Wed', pageViews: 8940, sessions: 2980, bounceRate: 38 },
  { day: 'Thu', pageViews: 11200, sessions: 3650, bounceRate: 29 },
  { day: 'Fri', pageViews: 12800, sessions: 4200, bounceRate: 27 },
  { day: 'Sat', pageViews: 10500, sessions: 3800, bounceRate: 31 },
  { day: 'Sun', pageViews: 9200, sessions: 3200, bounceRate: 36 },
];

export default function AdminAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$328,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Orders',
      value: '8,750',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'New Users',
      value: '2,340',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-0.3%',
      trend: 'down',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <div className="flex items-center mt-1">
                      <TrendIcon className={`h-4 w-4 mr-1 ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue and Orders Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Revenue & Orders Trend
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'revenue'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`px-3 py-1 text-sm rounded ${
                  selectedMetric === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Orders
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? `$${value?.toLocaleString()}` : value?.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Conversion Rate'
                  ]}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="revenue" />
                <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10B981" name="conversion" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-6 space-y-2">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: device.color }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {device.name} ({device.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {product.sales} sales • ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      product.growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </span>
                    {product.growth > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userBehaviorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="pageViews" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Page Views"
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Sessions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <Globe className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{source.source}</p>
                    <p className="text-sm text-gray-600">{source.visitors.toLocaleString()} visitors</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
