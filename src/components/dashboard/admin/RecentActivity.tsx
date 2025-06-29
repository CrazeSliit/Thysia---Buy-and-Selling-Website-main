"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Package,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Settings,
  Shield,
  TrendingUp
} from "lucide-react";

interface RecentActivityProps {
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
}

interface ActivityItem {
  id: string;
  type: 'user' | 'order' | 'payment' | 'support' | 'security' | 'system' | 'product' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  amount?: number;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user':
      return User;
    case 'order':
      return Package;
    case 'payment':
      return CreditCard;
    case 'support':
      return MessageSquare;
    case 'security':
      return Shield;
    case 'system':
      return Settings;
    case 'product':
      return Package;
    case 'review':
      return MessageSquare;
    default:
      return TrendingUp;
  }
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
    default:
      return 'text-green-600 bg-green-50 border-green-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RecentActivity({ recentOrders, recentUsers }: RecentActivityProps) {
  // Convert API data to activity items
  const activities: ActivityItem[] = [
    // Convert recent orders to activities
    ...recentOrders.slice(0, 5).map(order => ({
      id: order.id,
      type: 'order' as const,
      title: 'New Order Placed',
      description: `Order #${order.id.slice(-6)} by ${order.customerName} - $${order.amount.toFixed(2)}`,
      timestamp: new Date(order.createdAt),
      severity: order.amount > 500 ? 'high' as const : 'medium' as const,
      userName: order.customerName,
      amount: order.amount
    })),
    // Convert recent users to activities
    ...recentUsers.slice(0, 3).map(user => ({
      id: user.id,
      type: 'user' as const,
      title: 'New User Registration',
      description: `${user.name} joined as ${user.role.toLowerCase()}`,
      timestamp: new Date(user.createdAt),
      severity: 'low' as const,
      userId: user.id,
      userName: user.name
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Recent Activity
          <span className="text-sm text-gray-500 font-normal">
            Last 24 hours
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const severityClasses = getSeverityColor(activity.severity);
              
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${severityClasses}`}
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-white">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 flex-shrink-0">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    {activity.type === 'order' && activity.amount && (
                      <div className="flex items-center justify-between mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('pending')}`}>
                          Processing
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${activity.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {activity.type === 'user' && (
                      <div className="mt-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {activity.description.includes('buyer') ? 'Buyer' : 
                           activity.description.includes('seller') ? 'Seller' :
                           activity.description.includes('driver') ? 'Driver' : 'User'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          
          {activities.length > 0 && (
            <div className="pt-4 border-t">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All Activity
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
