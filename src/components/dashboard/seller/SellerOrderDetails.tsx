'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Edit3,
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag
} from 'lucide-react'
import Link from 'next/link'

interface SellerOrderDetailsProps {
  order: {
    id: string
    status: string
    total: number
    createdAt: string
    updatedAt: string
    buyer: {
      id: string
      name: string | null
      email: string
    }
    items: Array<{
      id: string
      quantity: number
      price: number
      product: {
        id: string
        name: string
        price: number
        imageUrl: string
        category: {
          name: string
        }
        seller: {
          id: string
          businessName: string | null
        }
      }
    }>
    delivery?: {
      id: string
      status: string
      driver?: {
        id: string
        user: {
          name: string | null
        }
        vehicleType: string | null
      }
    } | null
  }
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: Clock,
  },
}

const orderTimeline = [
  { status: 'PENDING', label: 'Order Placed', description: 'Order received' },
  { status: 'PROCESSING', label: 'Processing', description: 'Preparing order' },
  { status: 'SHIPPED', label: 'Shipped', description: 'Order shipped' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Order delivered' },
]

export default function SellerOrderDetails({ order }: SellerOrderDetailsProps) {
  const [updating, setUpdating] = useState(false)
  
  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon
  const currentStatusIndex = orderTimeline.findIndex(item => item.status === order.status)
  const sellerTotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/seller/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/dashboard/seller/orders"
          className="inline-flex items-center text-sm text-secondary-600 hover:text-secondary-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Orders
        </Link>
      </div>

      {/* Order Status and Timeline */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {status.label}
            </div>
            <p className="text-sm text-secondary-500 mt-2">
              Last updated {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-secondary-900">${sellerTotal.toFixed(2)}</p>
            <p className="text-sm text-secondary-500">Your portion</p>
            <p className="text-xs text-secondary-400">
              Total order: ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {orderTimeline.map((timelineItem, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              const isLast = index === orderTimeline.length - 1

              return (
                <div key={timelineItem.status} className="flex flex-col items-center relative">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className={`absolute top-4 left-8 w-full h-0.5 ${
                      isCompleted ? 'bg-primary-500' : 'bg-secondary-200'
                    }`} style={{ width: 'calc(100vw / 4)' }} />
                  )}
                  
                  {/* Timeline Node */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-primary-500 border-primary-500 text-white' 
                      : 'bg-white border-secondary-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-2 h-2 bg-secondary-300 rounded-full" />
                    )}
                  </div>
                  
                  {/* Timeline Content */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-primary-600' : isCompleted ? 'text-secondary-900' : 'text-secondary-400'
                    }`}>
                      {timelineItem.label}
                    </p>
                    <p className="text-xs text-secondary-500 mt-1 max-w-24">
                      {timelineItem.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-secondary-900">Your Products in this Order</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-secondary-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-secondary-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-secondary-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-secondary-500 mb-2">
                        Category: {item.product.category.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary-600">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="text-lg font-semibold text-secondary-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                      
                      <Link
                        href={`/dashboard/seller/products/${item.product.id}`}
                        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-500 mt-2"
                      >
                        View Product Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary and Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {order.buyer.name || 'Unknown Customer'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm text-secondary-600">
                    {order.buyer.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Order Date</p>
                  <p className="text-sm text-secondary-600">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Items</p>
                  <p className="text-sm text-secondary-600">
                    {order.items.length} product{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">Your Revenue</p>
                  <p className="text-sm text-secondary-600">
                    ${sellerTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {order.delivery && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-secondary-400" />
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      Status: {order.delivery.status}
                    </p>
                    {order.delivery.driver && (
                      <p className="text-sm text-secondary-500">
                        Driver: {order.delivery.driver.user.name || 'Assigned'}
                      </p>
                    )}
                  </div>
                </div>
                {order.delivery.driver?.vehicleType && (
                  <p className="text-sm text-secondary-500">
                    Vehicle: {order.delivery.driver.vehicleType}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {order.status === 'PENDING' && (
                <button
                  onClick={() => handleStatusUpdate('PROCESSING')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {updating ? 'Updating...' : 'Mark as Processing'}
                </button>
              )}
              
              {order.status === 'PROCESSING' && (
                <button
                  onClick={() => handleStatusUpdate('SHIPPED')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 disabled:opacity-50"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  {updating ? 'Updating...' : 'Mark as Shipped'}
                </button>
              )}
              
              {order.status === 'SHIPPED' && (
                <button
                  onClick={() => handleStatusUpdate('DELIVERED')}
                  disabled={updating}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {updating ? 'Updating...' : 'Mark as Delivered'}
                </button>
              )}
              
              <Link
                href="/dashboard/seller/orders"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
              >
                Back to All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
