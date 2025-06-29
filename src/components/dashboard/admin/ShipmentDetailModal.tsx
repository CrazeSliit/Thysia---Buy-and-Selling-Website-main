"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  X,
  Truck,
  User,
  MapPin,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  Edit,
  Save,
  Building,
  Phone,
  Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ShipmentDetailModalProps {
  shipmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onShipmentUpdate: () => void;
}

interface ShipmentDetails {
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
      stock: number;
    };
    seller: {
      id: string;
      name: string;
      email: string;
      sellerProfile?: {
        id: string;
        businessName?: string;
        businessAddress?: string;
        businessPhone?: string;
      };
    };
  }>;
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

export default function ShipmentDetailModal({ shipmentId, isOpen, onClose, onShipmentUpdate }: ShipmentDetailModalProps) {
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchShipmentDetails();
    }
  }, [isOpen, shipmentId]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/admin/shipments/${shipmentId}`);
      if (response.ok) {
        const data = await response.json();
        setShipment(data.shipment);
        setNewStatus(data.shipment.status);
      }
    } catch (error) {
      console.error('Error fetching shipment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!shipment || !newStatus || newStatus === shipment.status) return;

    try {
      const response = await fetch(`/api/dashboard/admin/shipments/${shipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setShipment(data.shipment);
        setEditing(false);
        onShipmentUpdate();
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Package;
    return <IconComponent className="w-3 h-3 mr-1" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipment Details
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
          ) : shipment ? (
            <div className="space-y-6">
              {/* Shipment Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Shipment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Shipment ID:</span>
                      <p className="font-mono text-sm text-gray-900">#{shipment.id}</p>
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
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
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
                                setNewStatus(shipment.status);
                              }}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[shipment.status as keyof typeof statusColors]}`}>
                              {getStatusIcon(shipment.status)}
                              {shipment.status}
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
                      <span className="text-sm font-medium text-gray-500">Order Date:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(shipment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(shipment.updatedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(shipment.updatedAt))} ago
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
                      <p className="text-sm text-gray-900">{shipment.buyer.user.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {shipment.buyer.user.email}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Customer Since:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(shipment.buyer.user.createdAt).toLocaleDateString()}
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
                  <div className="text-sm text-gray-900 space-y-1">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {shipment.shippingAddress.street}
                    </p>
                    <p className="ml-6">{shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.zipCode}</p>
                    <p className="ml-6">{shipment.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipment Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipment Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shipment.orderItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                <p className="text-sm text-gray-500">SKU: {item.product.id.slice(-8)}</p>
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
                            
                            {/* Seller Information */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Seller Information</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Business:</span>
                                  <p className="text-gray-900">
                                    {item.seller.sellerProfile?.businessName || item.seller.name}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Contact:</span>
                                  <p className="text-gray-900">{item.seller.email}</p>
                                </div>
                                {item.seller.sellerProfile?.businessAddress && (
                                  <div className="md:col-span-2">
                                    <span className="text-gray-500">Address:</span>
                                    <p className="text-gray-900">{item.seller.sellerProfile.businessAddress}</p>
                                  </div>
                                )}
                                {item.seller.sellerProfile?.businessPhone && (
                                  <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <p className="text-gray-900 flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {item.seller.sellerProfile.businessPhone}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(shipment.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="text-gray-900">{formatCurrency(shipment.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes:</span>
                      <span className="text-gray-900">{formatCurrency(shipment.taxes)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900">Total Value:</span>
                        <span className="text-gray-900">{formatCurrency(shipment.finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Shipment not found</p>
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
