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
  pendingReviews: number;
  activeDisputes: number;
  onlineUsers: number;
  todaySignups: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    activeDisputes: 0,
    onlineUsers: 0,
    todaySignups: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // fetchAdminStats();
    
    // Mock data for development
    setTimeout(() => {
      setStats({
        totalUsers: 15847,
        totalProducts: 8542,
        totalOrders: 23156,
        totalRevenue: 1234567.89,
        pendingReviews: 47,
        activeDisputes: 12,
        onlineUsers: 342,
        todaySignups: 28
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12.5%",
      changeType: "positive" as const
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8.2%",
      changeType: "positive" as const
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Truck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+23.1%",
      changeType: "positive" as const
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",      change: "+18.7%",
      changeType: "positive" as const
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews.toString(),
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "+5",
      changeType: "neutral" as const
    },
    {
      title: "Active Disputes",
      value: stats.activeDisputes.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "-2",
      changeType: "positive" as const
    },
    {
      title: "Online Users",
      value: stats.onlineUsers.toString(),
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: "Live",
      changeType: "neutral" as const
    },
    {
      title: "Today's Signups",
      value: stats.todaySignups.toString(),
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "+15",
      changeType: "positive" as const
    }
  ];

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
        <PlatformStats />
        
        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* User Management Section */}
      <UserManagement />
    </div>
  );
}
