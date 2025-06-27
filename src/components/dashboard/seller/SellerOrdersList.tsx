'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Search, 
  Filter, 
  Eye, 
  Edit3,
  User,
  Calendar,
  DollarSign,
  Hash,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'

interface SellerOrder {
  id: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  buyer: {
    id: string
    name: string
    email: string
    buyerProfile?: {
      phone?: string
      addresses: Array<{
        firstName: string
        lastName: string
        address1: string
        address2?: string
        city: string
        state: string
        zipCode: string
        country: string
        phone?: string
      }>
    }
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
    }
  }>
  delivery?: {
    id: string
    status: string
    driver?: {
      id: string
      user: {
        name: string
      }
    }
  }
}

interface SellerOrdersListProps {
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

export default function SellerOrdersList({ userId }: SellerOrdersListProps) {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, statusFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/seller/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setPagination(prev => ({
          ...prev,
          totalCount: data.pagination.totalCount,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh orders
        fetchOrders()
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
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
              placeholder="Search by order ID, customer, or product..."
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
      </div>      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
              <p className="text-xs text-gray-500">
                ${orders.reduce((sum, order) => {
                  const sellerTotal = order.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0)
                  return sum + sellerTotal
                }, 0).toFixed(2)} total value
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'PROCESSING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'SHIPPED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
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
              : 'Orders for your products will appear here'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Link
              href="/dashboard/seller/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Manage Products
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
            const StatusIcon = status.icon
            const sellerTotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-medium text-secondary-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.label}
                        </div>
                      </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-secondary-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{order.buyer.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{order.buyer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${sellerTotal.toFixed(2)} (your portion)</span>
                        </div>
                      </div>
                      
                      {/* Shipping Address */}
                      {order.buyer.buyerProfile?.addresses?.[0] && (
                        <div className="mt-3 p-3 bg-secondary-50 rounded-lg border">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-secondary-600" />
                            <span className="text-sm font-medium text-secondary-900">Shipping Address</span>
                          </div>
                          <div className="text-sm text-secondary-600">
                            <div>
                              {order.buyer.buyerProfile.addresses[0].firstName} {order.buyer.buyerProfile.addresses[0].lastName}
                            </div>
                            <div>{order.buyer.buyerProfile.addresses[0].address1}</div>
                            {order.buyer.buyerProfile.addresses[0].address2 && (
                              <div>{order.buyer.buyerProfile.addresses[0].address2}</div>
                            )}
                            <div>
                              {order.buyer.buyerProfile.addresses[0].city}, {order.buyer.buyerProfile.addresses[0].state} {order.buyer.buyerProfile.addresses[0].zipCode}
                            </div>
                            <div>{order.buyer.buyerProfile.addresses[0].country}</div>
                            {order.buyer.buyerProfile.addresses[0].phone && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Phone className="w-3 h-3" />
                                <span>{order.buyer.buyerProfile.addresses[0].phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {order.delivery && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Delivery Status</span>
                          </div>
                          <div className="text-sm text-blue-700">
                            Status: {order.delivery.status}
                            {order.delivery.driver && (
                              <span> • Driver: {order.delivery.driver.user.name}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/seller/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
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
                          </h4>
                          <p className="text-sm text-secondary-500">
                            Quantity: {item.quantity} • ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-sm font-medium text-secondary-900">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-secondary-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • 
                      Last updated {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Mark as Processing
                        </button>
                      )}
                      
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                          className="inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Mark as Shipped
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-secondary-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-secondary-600">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalCount)} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} orders
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
