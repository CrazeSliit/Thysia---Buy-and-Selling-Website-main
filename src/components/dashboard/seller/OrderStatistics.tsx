'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Calendar, 
  Star,
  Users,
  BarChart3
} from 'lucide-react';

interface OrderStatsData {
  totalRevenue: number;
  thisMonthRevenue: number;
  revenueGrowth: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  thisMonthOrders: number;
  orderCountGrowth: number;
  totalItemsSold: number;
  thisMonthItemsSold: number;
  itemsGrowth: number;
  totalReviews: number;
  avgRating: number;
  conversionRate: number;
}

interface OrderStatisticsProps {
  userId: string;
}

export default function OrderStatistics({ userId }: OrderStatisticsProps) {
  const [stats, setStats] = useState<OrderStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/seller/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load order statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subtitle: `$${stats.thisMonthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} this month`,
      change: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth}%`,
      changeType: stats.revenueGrowth >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      subtitle: `${stats.thisMonthOrders} this month`,
      change: `${stats.orderCountGrowth >= 0 ? '+' : ''}${stats.orderCountGrowth}%`,
      changeType: stats.orderCountGrowth >= 0 ? 'positive' : 'negative',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Items Sold',
      value: stats.totalItemsSold.toString(),
      subtitle: `${stats.thisMonthItemsSold} this month`,
      change: `${stats.itemsGrowth >= 0 ? '+' : ''}${stats.itemsGrowth}%`,
      changeType: stats.itemsGrowth >= 0 ? 'positive' : 'negative',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Product Portfolio',
      value: stats.totalProducts.toString(),
      subtitle: `${stats.activeProducts} active products`,
      change: `${((stats.activeProducts / stats.totalProducts) * 100).toFixed(1)}% active`,
      changeType: 'neutral',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Customer Reviews',
      value: stats.totalReviews.toString(),
      subtitle: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} avg rating` : 'No ratings yet',
      change: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5.0 stars` : 'Awaiting reviews',
      changeType: 'neutral',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      subtitle: 'Orders per 100 visitors',
      change: stats.conversionRate > 2 ? 'Good performance' : 'Room for improvement',
      changeType: stats.conversionRate > 2 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Statistics</h2>
          <p className="text-gray-600">Comprehensive view of your product sales and performance</p>
        </div>
        <div className="text-sm text-gray-500">
          <Calendar className="w-4 h-4 inline mr-1" />
          Updated in real-time
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mb-2">{stat.subtitle}</p>
                    <div className="flex items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700'
                          : stat.changeType === 'negative'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Key Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Revenue Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-medium">
                    ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenue per Product</span>
                  <span className="font-medium">
                    ${stats.totalProducts > 0 ? (stats.totalRevenue / stats.totalProducts).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className={`font-medium ${
                    stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Product Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items per Order</span>
                  <span className="font-medium">
                    {stats.totalOrders > 0 ? (stats.totalItemsSold / stats.totalOrders).toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products with Orders</span>
                  <span className="font-medium">
                    {stats.totalProducts > 0 ? Math.min(100, (stats.totalOrders / stats.totalProducts * 100)).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer Satisfaction</span>
                  <span className={`font-medium ${
                    stats.avgRating >= 4 ? 'text-green-600' : 
                    stats.avgRating >= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5.0` : 'No ratings'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
