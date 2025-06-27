'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Shipment {
  id: string;
  orderId: string;
  status: string;
  driverId?: string; // Add driverId to know if it's assigned
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    buyer: {
      id: string;
      name: string;
      email: string;
    };
    orderItems: Array<{
      id: string;
      quantity: number;
      priceAtTime: number;
      totalPrice: number;
      product: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        seller: {
          businessName: string;
        };
      };
    }>;
    shippingAddress: {
      id: string;
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
}

export default function DriverShipmentsPage() {
  const { data: session } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/driver/shipments');
      if (response.ok) {
        const data = await response.json();
        setShipments(Array.isArray(data.deliveries) ? data.deliveries : []); // Ensure it's always an array
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load shipments');
        setShipments([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
      setShipments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };  const updateShipmentStatus = async (shipmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/driver/shipments/${shipmentId}`, {
        method: 'PATCH', // Use PATCH instead of PUT to match the API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedShipment = await response.json();
        // Update the shipment in the local state
        setShipments(prevShipments => 
          prevShipments.map(s => 
            s.id === shipmentId ? { ...s, status: updatedShipment.delivery?.status || status } : s
          )
        );
        toast.success('Delivery status updated');
        
        // If the delivery is completed or failed, remove it from the list after a delay
        if (status === 'DELIVERED' || status === 'FAILED') {
          setTimeout(() => {
            setShipments(prevShipments => 
              prevShipments.filter(s => s.id !== shipmentId)
            );
          }, 2000);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const acceptShipment = async (shipmentId: string) => {
    try {
      const response = await fetch(`/api/driver/shipments/${shipmentId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Update the shipment in the local state
        setShipments(prevShipments => 
          prevShipments.map(s => 
            s.id === shipmentId ? { ...s, ...result.delivery, driverId: 'assigned' } : s
          )
        );
        toast.success('Shipment accepted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to accept shipment');
      }
    } catch (error) {
      console.error('Error accepting shipment:', error);
      toast.error('Failed to accept shipment');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_PICKUP':
        return 'bg-orange-100 text-orange-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Shipments</h1>
        <p className="text-gray-600">View and manage available deliveries and your assigned shipments</p>
      </div>      {shipments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No shipments available</div>
          <p className="text-gray-400 mt-2">Check back later for new delivery opportunities</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery #{shipment.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Order #{shipment.order.orderNumber}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                  <p className="text-sm text-gray-600">{shipment.order.buyer.name}</p>
                  <p className="text-sm text-gray-600">{shipment.order.buyer.email}</p>
                  <p className="text-sm text-gray-600">Amount: ${shipment.order.totalAmount.toFixed(2)}</p>
                </div>                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">
                    {shipment.order.shippingAddress.firstName} {shipment.order.shippingAddress.lastName}<br />
                    {shipment.order.shippingAddress.address1}
                    {shipment.order.shippingAddress.address2 && (
                      <><br />{shipment.order.shippingAddress.address2}</>
                    )}<br />
                    {shipment.order.shippingAddress.city}, {shipment.order.shippingAddress.state} {shipment.order.shippingAddress.zipCode}<br />
                    {shipment.order.shippingAddress.country}
                  </p>
                </div>
              </div>              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Timeline</h4>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(shipment.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {shipment.status.replace('_', ' ')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-1">
                    {shipment.order.orderItems.slice(0, 3).map((item) => (
                      <p key={item.id} className="text-sm text-gray-600">
                        {item.product.name} x {item.quantity}
                      </p>
                    ))}
                    {shipment.order.orderItems.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{shipment.order.orderItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              </div>              {/* Action buttons */}
              {shipment.status !== 'DELIVERED' && shipment.status !== 'FAILED' && (
                <div className="flex space-x-2">
                  {/* If delivery is unassigned (PENDING status with no driverId), show accept button */}
                  {shipment.status === 'PENDING' && !shipment.driverId && (
                    <button
                      onClick={() => acceptShipment(shipment.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                    >
                      Accept Shipment
                    </button>
                  )}
                  
                  {/* If delivery is assigned to this driver, show status update buttons */}
                  {shipment.driverId && (
                    <>
                      {shipment.status === 'PENDING_PICKUP' && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'OUT_FOR_DELIVERY')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Start Delivery
                        </button>
                      )}
                      
                      {shipment.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'DELIVERED')}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      <button
                        onClick={() => updateShipmentStatus(shipment.id, 'FAILED')}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        Mark as Failed
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
