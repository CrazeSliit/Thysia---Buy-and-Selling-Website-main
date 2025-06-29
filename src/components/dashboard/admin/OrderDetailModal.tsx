"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Package,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  Ban,
  Edit,
  Save
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OrderDetailModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdate: () => void;
}

interface OrderDetails {
  id: string;
  status: string;
  totalAmount: number;
  shippingFee: number;
  taxes: number;
  finalAmount: number;
  createdAt: string;
  updatedAt: string;
  buyer: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
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
    };
  }>;
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

export default function OrderDetailModal({ orderId, isOpen, onClose, onOrderUpdate }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus || newStatus === order.status) return;

    try {
      const response = await fetch(`/api/dashboard/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setEditing(false);
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Order ID:</span>
                      <p className="font-mono text-sm text-gray-900">#{order.id}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {editing ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                            <button
                              onClick={handleUpdateStatus}
                              className="p-1 text-green-600 hover:text-green-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditing(false);
                                setNewStatus(order.status);
                              }}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status as keyof typeof statusColors]}`}>
                              {React.createElement(statusIcons[order.status as keyof typeof statusIcons], { className: "w-3 h-3 mr-1" })}
                              {order.status}
                            </span>
                            <button
                              onClick={() => setEditing(true)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt))} ago
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-sm text-gray-900">{order.buyer.user.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900">{order.buyer.user.email}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Customer Since:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(order.buyer.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-900">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">Sold by: {item.seller.name}</p>
                          <p className="text-sm text-gray-500">Seller Email: {item.seller.email}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">{formatCurrency(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="text-gray-900">{formatCurrency(order.taxes)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">{formatCurrency(order.finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Order not found</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
