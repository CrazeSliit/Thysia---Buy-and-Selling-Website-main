"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  UserCheck,
  Activity
} from "lucide-react";
import AdminQuickActions from "./AdminQuickActions";
import PlatformStats from "./PlatformStats";
import RecentActivity from "./RecentActivity";
import UserManagement from "./UserManagement";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  totalReviews: number;
  todaySignups: number;
  weeklySignups: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  lowStockProducts: number;
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
  recentOrders: Array<{
    id: string;
    status: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category: { name: string };
    totalSold: number;
    orderCount: number;
  }>;
  insights: {
    conversionRate: number;
    repeatCustomerRate: number;
    customerSatisfaction: number;
    platformGrowth: string;
  };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `${stats.weeklySignups} this week`,
      changeType: "positive" as const
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${stats.activeProducts} active`,
      changeType: "positive" as const
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `${stats.orderBreakdown.pending} pending`,
      changeType: "neutral" as const
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth}%`,
      changeType: stats.revenueGrowth > 0 ? "positive" : stats.revenueGrowth < 0 ? "negative" : "neutral" as const
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews.toString(),
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "Quality feedback",
      changeType: "neutral" as const
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "Products < 10",
      changeType: stats.lowStockProducts > 0 ? "negative" : "positive" as const
    },
    {
      title: "Average Order",
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "Per order",
      changeType: "neutral" as const
    },
    {
      title: "Today's Signups",
      value: stats.todaySignups.toString(),
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "New users",
      changeType: "positive" as const
    }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 font-medium">Error loading dashboard data</p>
            </div>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button 
              onClick={fetchAdminStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'neutral' ? 'text-gray-600' :
                      'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <AdminQuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Analytics */}
        <PlatformStats stats={stats} />
        
        {/* Recent Activity */}
        <RecentActivity recentOrders={stats.recentOrders} recentUsers={stats.recentUsers} />
      </div>

      {/* User Management Section */}
      <UserManagement recentUsers={stats.recentUsers} userBreakdown={stats.userBreakdown} />
    </div>
  );
}
