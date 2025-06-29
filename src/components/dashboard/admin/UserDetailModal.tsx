"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Package,
  CreditCard,
  MapPin,
  Star,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Save,
  Ban,
  Unlock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserDetailModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  isActive: boolean;
  joinedAt: string;
  lastLoginAt?: string;
  buyerProfile?: any;
  sellerProfile?: any;
  driverProfile?: any;
  orders: any[];
  notifications: any[];
  stats: {
    ordersByStatus: any[];
    totalSpent: number;
    sellerRevenue: number;
  };
  _count: {
    orders: number;
    messagesSent: number;
    messagesReceived: number;
  };
}

export default function UserDetailModal({ userId, isOpen, onClose, onUserUpdate }: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          role: data.user.role || "",
          notes: data.user.notes || ""
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setEditing(false);
        fetchUserDetails();
        onUserUpdate();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const response = await fetch("/api/dashboard/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          action: "toggleActive" 
        })
      });

      if (response.ok) {
        fetchUserDetails();
        onUserUpdate();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-100";
      case "SUSPENDED":
        return "text-yellow-600 bg-yellow-100";
      case "BANNED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return CheckCircle;
      case "SUSPENDED":
        return AlertTriangle;
      case "BANNED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "text-red-600 bg-red-100";
      case "SELLER":
        return "text-blue-600 bg-blue-100";
      case "DRIVER":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
                <div className="flex items-center space-x-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-1"
                      />
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{user.name || "N/A"}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    {editing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-1"
                      />
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-1"
                        placeholder="Phone number"
                      />
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{user.phone || "N/A"}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    {editing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-3 py-1"
                      >
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                        <option value="DRIVER">Driver</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive ? "ACTIVE" : "SUSPENDED")}`}>
                          {user.isActive ? "ACTIVE" : "SUSPENDED"}
                        </span>
                        <button
                          onClick={handleStatusToggle}
                          className={`p-1 rounded ${user.isActive ? "text-red-600 hover:bg-red-100" : "text-green-600 hover:bg-green-100"}`}
                          title={user.isActive ? "Suspend User" : "Activate User"}
                        >
                          {user.isActive ? <Ban className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">{user._count.orders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold">${user.stats.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="text-2xl font-bold">{user._count.messagesSent + user._count.messagesReceived}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            {user.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.totalAmount?.toFixed(2) || "0.00"}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                            order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile-specific information */}
            {user.buyerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Buyer Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Addresses</p>
                      <p className="font-medium">{user.buyerProfile._count?.addresses || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                      <p className="font-medium">{user.buyerProfile._count?.wishlists || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.sellerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="font-medium">{user.sellerProfile._count?.products || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="font-medium">${user.stats.sellerRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  {user.sellerProfile.products && user.sellerProfile.products.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recent Products</p>
                      <div className="space-y-2">
                        {user.sellerProfile.products.slice(0, 3).map((product: any) => (
                          <div key={product.id} className="flex justify-between text-sm">
                            <span>{product.name}</span>
                            <span>${product.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-600">User not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
