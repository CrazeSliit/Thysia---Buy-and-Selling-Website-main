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

interface ActivityItem {
  id: string;
  type: 'user' | 'order' | 'payment' | 'support' | 'security' | 'system' | 'product' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
}

// Mock activity data
const recentActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'security',
    title: 'Suspicious Login Detected',
    description: 'Multiple failed login attempts from IP 192.168.1.100',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    severity: 'high'
  },
  {
    id: '2',
    type: 'user',
    title: 'New User Registration',
    description: 'Sarah Johnson joined the platform',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    severity: 'low',
    userId: 'user-123',
    userName: 'Sarah Johnson'
  },
  {
    id: '3',
    type: 'payment',
    title: 'High-Value Transaction',
    description: 'Order #ORD-2024-001 processed for $5,250',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    severity: 'medium'
  },
  {
    id: '4',
    type: 'support',
    title: 'New Support Ticket',
    description: 'Customer reported payment issue - Ticket #SUP-456',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'medium'
  },
  {
    id: '5',
    type: 'product',
    title: 'Product Review Flagged',
    description: 'Review for "Premium Headphones" flagged for inappropriate content',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    severity: 'medium'
  },
  {
    id: '6',
    type: 'system',
    title: 'Database Backup Completed',
    description: 'Daily backup completed successfully at 02:00 AM',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    severity: 'low'
  },
  {
    id: '7',
    type: 'order',
    title: 'Bulk Order Placed',
    description: 'Corporate client placed order for 500+ items',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'low'
  },
  {
    id: '8',
    type: 'user',
    title: 'Seller Account Suspended',
    description: 'Account "TechWorld Store" suspended due to policy violations',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    severity: 'high'
  }
];

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

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Recent Activity
          <button className="text-sm text-blue-600 hover:text-blue-800 font-normal">
            View All
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const severityClasses = getSeverityColor(activity.severity);

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-full ${severityClasses}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      activity.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      activity.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.severity || 'low'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
            Load More Activities
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
