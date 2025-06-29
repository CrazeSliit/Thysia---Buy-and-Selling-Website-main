"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Ban,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Unlock,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserDetailModal from "./UserDetailModal";
import AddUserModal from "./AddUserModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'DRIVER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';
  isActive: boolean;
  joinedAt: Date;
  lastLogin: Date | null;
  orders: number;
  revenue?: number;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  dateRange: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'ALL',
    status: 'ALL',
    dateRange: 'ALL'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.role !== 'ALL' && { role: filters.role }),
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/dashboard/admin/users?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data for development
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/dashboard/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userIds: selectedUsers, 
          action: `bulk${action.charAt(0).toUpperCase() + action.slice(1)}` 
        })
      });

      if (response.ok) {
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          setSelectedUserId(userId);
          setShowUserDetail(true);
          break;
          
        case 'edit':
          setSelectedUserId(userId);
          setShowUserDetail(true);
          break;

        case 'suspend':
        case 'activate':
        case 'toggleActive':
          const response = await fetch('/api/dashboard/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action })
          });

          if (response.ok) {
            fetchUsers();
          }
          break;

        case 'message':
          // TODO: Implement messaging system
          console.log(`Send message to user ${userId}`);
          break;

        case 'promote':
          // TODO: Implement role change dialog
          console.log(`Change role for user ${userId}`);
          break;

        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...(filters.role !== 'ALL' && { role: filters.role }),
        ...(filters.status !== 'ALL' && { status: filters.status }),
      });

      const response = await fetch(`/api/admin/users/export?${queryParams}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SELLER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRIVER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUYER':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BANNED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle;
      case 'SUSPENDED':
        return AlertTriangle;
      case 'BANNED':
        return XCircle;
      case 'PENDING':
      default:
        return Clock;
    }
  };

  // Mock data for development
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'BUYER',
      status: 'ACTIVE',
      isActive: true,
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
      isActive: false,
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
      isActive: true,
      joinedAt: new Date('2024-02-01'),
      lastLogin: new Date(Date.now() - 30 * 60 * 1000),
      orders: 89
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'ALL' || user.role === filters.role;
    const matchesStatus = filters.status === 'ALL' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'ACTIVE').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'SUSPENDED').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Today</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return u.joinedAt >= today;
                  }).length}
                </p>
              </div>
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Roles</option>
                <option value="BUYER">Buyers</option>
                <option value="SELLER">Sellers</option>
                <option value="DRIVER">Drivers</option>
                <option value="ADMIN">Admins</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    Activate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('suspend')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm disabled:opacity-50"
                  >
                    Suspend Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
              <button 
                onClick={() => handleExport('csv')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button 
                onClick={() => handleExport('json')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Export JSON
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            {selectedUsers.length > 0 && (
              <span className="text-sm font-normal text-gray-600">
                {selectedUsers.length} selected
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Activity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const StatusIcon = getStatusIcon(user.status);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">{user.orders} orders</div>
                        <div className="text-xs text-gray-600">
                          Last login: {user.lastLogin ? formatDistanceToNow(user.lastLogin, { addSuffix: true }) : 'Never'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {formatDistanceToNow(user.joinedAt, { addSuffix: true })}
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
                          {user.isActive ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Suspend User"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Activate User"
                            >
                              <Unlock className="h-4 w-4" />
                            </button>
                          )}
                          {user.role !== 'ADMIN' && (
                            <>
                              <button
                                onClick={() => handleUserAction(user.id, 'promote')}
                                className="p-1 text-gray-400 hover:text-indigo-600"
                                title="Change Role"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <UserDetailModal
        userId={selectedUserId || ''}
        isOpen={showUserDetail}
        onClose={() => {
          setShowUserDetail(false);
          setSelectedUserId(null);
        }}
        onUserUpdate={fetchUsers}
      />

      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={fetchUsers}
      />
    </div>
  );
}
