"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Package,
  User,
  Calendar,
  DollarSign,
  FileText,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ShipmentDetailModal from "./ShipmentDetailModal";

interface Shipment {
  id: string;
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
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
      price: number;
    };
    seller: {
      id: string;
      name: string;
      email: string;
      sellerProfile?: {
        businessName?: string;
        businessAddress?: string;
      };
    };
  }>;
}

interface Driver {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ShipmentFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  driverId: string;
}

interface ShipmentStats {
  totalShipments: number;
  totalValue: number;
  totalShippingFees: number;
  statusCounts: Record<string, number>;
}

const statusColors = {
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200"
};

const statusIcons = {
  CONFIRMED: CheckCircle,
  PROCESSING: RefreshCcw,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle
};

export default function AdminShipmentManagement() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ShipmentStats>({
    totalShipments: 0,
    totalValue: 0,
    totalShippingFees: 0,
    statusCounts: {}
  });
  const [filters, setFilters] = useState<ShipmentFilters>({
    search: '',
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    driverId: 'ALL'
  });
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showShipmentDetail, setShowShipmentDetail] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchShipments();
  }, [filters, currentPage]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.driverId !== 'ALL' && { driverId: filters.driverId }),
      });

      const response = await fetch(`/api/dashboard/admin/shipments?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setShipments(data.shipments);
        setDrivers(data.drivers);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      // Use mock data for development
      setShipments(mockShipments);
      setDrivers(mockDrivers);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedShipments.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/dashboard/admin/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderIds: selectedShipments, 
          action: `bulk${action.charAt(0).toUpperCase() + action.slice(1)}` 
        })
      });

      if (response.ok) {
        setSelectedShipments([]);
        fetchShipments();
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleShipmentAction = async (shipmentId: string, action: string, status?: string) => {
    try {
      switch (action) {
        case 'view':
          setSelectedShipmentId(shipmentId);
          setShowShipmentDetail(true);
          break;
          
        case 'updateStatus':
          if (!status) return;
          const response = await fetch('/api/dashboard/admin/shipments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: shipmentId, action, status })
          });

          if (response.ok) {
            fetchShipments();
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

      const response = await fetch(`/api/dashboard/admin/shipments/export?${queryParams}`);
      
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `shipments_export_${new Date().toISOString().split('T')[0]}.csv`;
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
          a.download = `shipments_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Error exporting shipments:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleShipmentSelection = (shipmentId: string) => {
    setSelectedShipments(prev => 
      prev.includes(shipmentId) 
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const selectAllShipments = () => {
    if (selectedShipments.length === shipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(shipments.map(shipment => shipment.id));
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
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShipments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusCounts.SHIPPED || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
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
              <Truck className="h-5 w-5" />
              Shipment Management
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
                  placeholder="Search by shipment ID, customer name, or email..."
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
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
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
          {selectedShipments.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedShipments.length} shipment(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('ship')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                  >
                    Ship
                  </button>
                  <button
                    onClick={() => handleBulkAction('deliver')}
                    disabled={bulkActionLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Deliver
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shipments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedShipments.length === shipments.length && shipments.length > 0}
                      onChange={selectAllShipments}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Shipment ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((shipment) => {
                  const StatusIcon = statusIcons[shipment.status];
                  return (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedShipments.includes(shipment.id)}
                          onChange={() => toggleShipmentSelection(shipment.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-900">
                          #{shipment.id.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{shipment.buyer.user.name}</p>
                          <p className="text-sm text-gray-500">{shipment.buyer.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[shipment.status]}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {shipment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          <p>{shipment.shippingAddress.city}, {shipment.shippingAddress.state}</p>
                          <p className="text-xs text-gray-500">{shipment.shippingAddress.zipCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(shipment.finalAmount)}</p>
                          {shipment.shippingFee > 0 && (
                            <p className="text-xs text-gray-500">
                              +{formatCurrency(shipment.shippingFee)} shipping
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(shipment.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Updated {formatDistanceToNow(new Date(shipment.updatedAt))} ago
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleShipmentAction(shipment.id, 'view')}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleShipmentAction(shipment.id, 'updateStatus', e.target.value);
                                e.target.value = ''; // Reset select
                              }
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="" disabled>Update Status</option>
                            <option value="PROCESSING">Process</option>
                            <option value="SHIPPED">Ship</option>
                            <option value="DELIVERED">Deliver</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {shipments.length === 0 && (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No shipments found</p>
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

      {/* Shipment Detail Modal */}
      <ShipmentDetailModal
        shipmentId={selectedShipmentId || ''}
        isOpen={showShipmentDetail}
        onClose={() => {
          setShowShipmentDetail(false);
          setSelectedShipmentId(null);
        }}
        onShipmentUpdate={fetchShipments}
      />
    </div>
  );
}

// Mock data for development
const mockShipments: Shipment[] = [
  {
    id: "64a1b2c3d4e5f6789012345a",
    status: "SHIPPED",
    totalAmount: 99.99,
    shippingFee: 9.99,
    taxes: 8.99,
    finalAmount: 118.97,
    createdAt: new Date("2024-06-25T10:30:00Z"),
    updatedAt: new Date("2024-06-26T14:20:00Z"),
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
          imageUrl: "/api/placeholder/150/150",
          price: 49.99
        },
        seller: {
          id: "seller1",
          name: "TechStore Inc",
          email: "sales@techstore.com",
          sellerProfile: {
            businessName: "TechStore Inc",
            businessAddress: "456 Business Ave, Tech City, CA 90210"
          }
        }
      }
    ]
  }
];

const mockDrivers: Driver[] = [
  {
    id: "driver1",
    user: {
      id: "user456",
      name: "Mike Driver",
      email: "mike@delivery.com"
    }
  }
];
