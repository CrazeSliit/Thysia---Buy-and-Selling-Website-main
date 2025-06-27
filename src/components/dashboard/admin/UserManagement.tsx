"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Mail,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'DRIVER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';
  joinedAt: Date;
  lastLogin: Date | null;
  orders: number;
  revenue?: number;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'BUYER',
    status: 'ACTIVE',
    joinedAt: new Date('2024-01-15'),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    orders: 23
  },
  {
    id: '2',
    name: 'TechWorld Store',
    email: 'contact@techworld.com',
    role: 'SELLER',
    status: 'SUSPENDED',
    joinedAt: new Date('2023-11-20'),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
    orders: 156,
    revenue: 45230.50
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.driver@example.com',
    role: 'DRIVER',
    status: 'ACTIVE',
    joinedAt: new Date('2024-02-01'),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    orders: 89
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'BUYER',
    status: 'PENDING',
    joinedAt: new Date(Date.now() - 5 * 60 * 1000),
    lastLogin: null,
    orders: 0
  },
  {
    id: '5',
    name: 'Fashion Hub',
    email: 'hello@fashionhub.com',
    role: 'SELLER',
    status: 'ACTIVE',
    joinedAt: new Date('2023-12-10'),
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    orders: 78,
    revenue: 12450.75
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800';
    case 'SELLER':
      return 'bg-blue-100 text-blue-800';
    case 'DRIVER':
      return 'bg-green-100 text-green-800';
    case 'BUYER':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800';
    case 'BANNED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
    default:
      return 'bg-orange-100 text-orange-800';
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUserAction = (userId: string, action: string) => {
    // TODO: Implement actual user actions
    console.log(`Action ${action} for user ${userId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-normal">
            Manage All Users
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Roles</option>
              <option value="BUYER">Buyers</option>
              <option value="SELLER">Sellers</option>
              <option value="DRIVER">Drivers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{user.orders}</div>
                    {user.revenue && (
                      <div className="text-xs text-gray-600">
                        ${user.revenue.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : 'Never'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'view')}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'message')}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Send Message"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      {user.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found matching your filters.</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
