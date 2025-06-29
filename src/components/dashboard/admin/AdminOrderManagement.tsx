"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Ban,
  RefreshCcw,
  Calendar,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import OrderDetailModal from "./OrderDetailModal";

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  shippingFee: number;
  taxes: number;
  finalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    user: {
      id: string;
      name: string;
      email: string;
    }
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl?: string;
    };
    seller: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface OrderFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200"
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: RefreshCcw,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: Ban
};

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    statusCounts: {}
  });
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'ALL',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/dashboard/admin/orders?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Use mock data for development
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/dashboard/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderIds: selectedOrders, 
          action: `bulk${action.charAt(0).toUpperCase() + action.slice(1)}` 
        })
      });

      if (response.ok) {
        setSelectedOrders([]);
        fetchOrders();
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: string, status?: string) => {
    try {
      switch (action) {
        case 'view':
          setSelectedOrderId(orderId);
          setShowOrderDetail(true);
          break;
          
        case 'updateStatus':
          if (!status) return;
          const response = await fetch('/api/dashboard/admin/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, action, status })
          });

          if (response.ok) {
            fetchOrders();
          }
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
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const response = await fetch(`/api/dashboard/admin/orders/export?${queryParams}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
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
          a.download = `orders_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.PENDING || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.DELIVERED || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
              >
                <FileText className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                placeholder="From date"
              />

              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                placeholder="To date"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedOrders.length} order(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('confirm')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleBulkAction('ship')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Ship
                  </button>
                  <button
                    onClick={() => handleBulkAction('cancel')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={selectAllOrders}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-900">
                          #{order.id.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.buyer.user.name}</p>
                          <p className="text-sm text-gray-500">{order.buyer.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {order.orderItems.length} item(s)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(order.finalAmount)}</p>
                          {order.shippingFee > 0 && (
                            <p className="text-xs text-gray-500">
                              +{formatCurrency(order.shippingFee)} shipping
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(order.createdAt))} ago
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOrderAction(order.id, 'view')}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleOrderAction(order.id, 'updateStatus', e.target.value);
                                e.target.value = ''; // Reset select
                              }
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="" disabled>Update Status</option>
                            <option value="CONFIRMED">Confirm</option>
                            <option value="PROCESSING">Process</option>
                            <option value="SHIPPED">Ship</option>
                            <option value="DELIVERED">Deliver</option>
                            <option value="CANCELLED">Cancel</option>
                            <option value="REFUNDED">Refund</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId || ''}
        isOpen={showOrderDetail}
        onClose={() => {
          setShowOrderDetail(false);
          setSelectedOrderId(null);
        }}
        onOrderUpdate={fetchOrders}
      />
    </div>
  );
}

// Mock data for development
const mockOrders: Order[] = [
  {
    id: "64a1b2c3d4e5f6789012345a",
    status: "PENDING",
    totalAmount: 99.99,
    shippingFee: 9.99,
    taxes: 8.99,
    finalAmount: 118.97,
    createdAt: new Date("2024-06-25T10:30:00Z"),
    updatedAt: new Date("2024-06-25T10:30:00Z"),
    buyer: {
      user: {
        id: "user123",
        name: "John Doe",
        email: "john.doe@example.com"
      }
    },
    shippingAddress: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA"
    },
    orderItems: [
      {
        id: "item1",
        quantity: 2,
        price: 49.99,
        product: {
          id: "prod1",
          name: "Wireless Headphones",
          imageUrl: "/api/placeholder/150/150"
        },
        seller: {
          id: "seller1",
          name: "TechStore Inc",
          email: "sales@techstore.com"
        }
      }
    ]
  }
];
