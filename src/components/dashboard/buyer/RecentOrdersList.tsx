'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Eye } from 'lucide-react'

interface OrderItem {
  productName: string
  productImage?: string
  price: number
}

interface RecentOrder {
  id: string
  status: string
  total: number
  createdAt: string
  itemCount: number
  firstItem: OrderItem | null
}

interface RecentOrdersListProps {
  userId: string
}

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export default function RecentOrdersList({ userId }: RecentOrdersListProps) {
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
  }, [userId])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/buyer/dashboard-overview')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.recentOrders || [])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link 
            href="/dashboard/buyer/orders"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all orders
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
            
            return (
              <div key={order.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                {/* Order Image */}
                <div className="flex-shrink-0">
                  {order.firstItem?.productImage ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden">                      <Image
                        src={order.firstItem.productImage}
                        alt={order.firstItem.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.firstItem ? order.firstItem.productName : `${order.itemCount} items`}
                    {order.itemCount > 1 && ` + ${order.itemCount - 1} more`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Order Total and Actions */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                  <Link
                    href={`/dashboard/buyer/orders/${order.id}`}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500 mt-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
