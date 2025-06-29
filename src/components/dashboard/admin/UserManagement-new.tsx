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

interface UserManagementProps {
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  userBreakdown: {
    buyers: number;
    sellers: number;
    drivers: number;
    admins: number;
  };
}

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

export default function UserManagement({ recentUsers, userBreakdown }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [users, setUsers] = useState<User[]>([]);

  // Convert API data to component format
  useEffect(() => {
    const convertedUsers: User[] = recentUsers.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role as 'BUYER' | 'SELLER' | 'DRIVER' | 'ADMIN',
      status: user.isActive ? 'ACTIVE' : 'SUSPENDED' as const,
      joinedAt: new Date(user.createdAt),
      lastLogin: new Date(user.createdAt), // API doesn't provide lastLogin, using createdAt
      orders: 0 // API doesn't provide orders count
    }));
    setUsers(convertedUsers);
  }, [recentUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'SELLER':
        return 'bg-green-100 text-green-800';
      case 'DRIVER':
        return 'bg-blue-100 text-blue-800';
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
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Buyers</p>
                <p className="text-2xl font-bold text-blue-600">{userBreakdown.buyers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold text-green-600">{userBreakdown.sellers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-yellow-600">{userBreakdown.drivers}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-purple-600">{userBreakdown.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            Recent Users
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="BUYER">Buyers</option>
                <option value="SELLER">Sellers</option>
                <option value="DRIVER">Drivers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDistanceToNow(user.joinedAt, { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-yellow-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
