'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Package, Clock, CheckCircle, Truck, Search, Filter, Eye, RotateCcw, Star } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  orderItems: Array<{
    id: string
    quantity: number
    priceAtTime: number
    product: {
      id: string
      name: string
      imageUrl: string
    }
  }>
}

interface OrdersListProps {
  userId: string
}

// Order status configuration
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

export default function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchOrders()
  }, [userId])

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/dashboard/buyer/orders`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-secondary-200 rounded w-32"></div>
              <div className="h-6 bg-secondary-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
              <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'No orders found' : 'No orders yet'}
          </h3>
          <p className="text-secondary-500 mb-6">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start shopping to see your orders here'
            }
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
            const StatusIcon = status.icon

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-secondary-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-secondary-500">
                          Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {status.label}
                      </div>
                    </div>                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary-900">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-secondary-200 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-secondary-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-secondary-900">
                            {item.product.name}
                          </h4>                          <p className="text-sm text-secondary-500">
                            Quantity: {item.quantity} • ${item.priceAtTime.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-sm font-medium text-secondary-900">
                            ${(item.quantity * item.priceAtTime).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <Link
                        href={`/dashboard/buyer/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                      
                      {order.status === 'DELIVERED' && (
                        <button className="inline-flex items-center px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50">
                          <Star className="w-4 h-4 mr-2" />
                          Write Review
                        </button>
                      )}
                      
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <button className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Cancel Order
                        </button>
                      )}
                    </div>
                    
                    {order.status === 'SHIPPED' && (
                      <button className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50">
                        <Truck className="w-4 h-4 mr-2" />
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
