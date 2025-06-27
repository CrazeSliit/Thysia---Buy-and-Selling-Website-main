"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  Settings,
  Shield,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Mail,
  Bell,
  Download
} from "lucide-react";

const quickActions = [
  {
    title: "User Management",
    description: "Manage users, roles, and permissions",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    href: "/dashboard/admin/users"
  },
  {
    title: "Product Reviews",
    description: "Review pending product submissions",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-50",
    href: "/dashboard/admin/products"
  },
  {
    title: "System Settings",
    description: "Configure platform settings",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    href: "/dashboard/admin/settings"
  },
  {
    title: "Security Center",
    description: "Monitor security and compliance",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    href: "/dashboard/admin/security"
  },
  {
    title: "Support Tickets",
    description: "Handle customer support requests",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    href: "/dashboard/admin/support"
  },
  {
    title: "Dispute Resolution",
    description: "Resolve order and payment disputes",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    href: "/dashboard/admin/disputes"
  },
  {
    title: "Analytics Dashboard",
    description: "View detailed platform analytics",
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    href: "/dashboard/admin/analytics"
  },
  {
    title: "Email Campaigns",
    description: "Manage marketing campaigns",
    icon: Mail,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    href: "/dashboard/admin/campaigns"
  },
  {
    title: "System Alerts",
    description: "Monitor system health and alerts",
    icon: Bell,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    href: "/dashboard/admin/alerts"
  },
  {
    title: "Data Export",
    description: "Export platform data and reports",
    icon: Download,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    href: "/dashboard/admin/exports"
  }
];

export default function AdminQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                onClick={() => {
                  // TODO: Implement navigation
                  console.log(`Navigate to ${action.href}`);
                }}
              >
                <div className={`p-3 rounded-full ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900 text-center">
                  {action.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600 text-center leading-tight">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
