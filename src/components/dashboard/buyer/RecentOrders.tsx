import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'
import { Package, Clock, CheckCircle, Truck } from 'lucide-react'
import Link from 'next/link'

interface RecentOrdersProps {
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

async function getRecentOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    return orders
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

export default async function RecentOrders({ userId }: RecentOrdersProps) {
  const orders = await getRecentOrders(userId)

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <Package className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
        <p className="text-secondary-500 mb-4">No orders yet</p>
        <Link
          href="/products"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
          const StatusIcon = status.icon
          const firstItem = order.orderItems[0]

          return (
            <div key={order.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-secondary-50 transition-colors">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {firstItem?.product?.imageUrl ? (
                  <img
                    src={firstItem.product.imageUrl}
                    alt={firstItem.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-secondary-200 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary-400" />
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    Order #{order.id.slice(-8)}
                  </p>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </div>
                </div>                <p className="text-sm text-secondary-500">
                  {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''} • ${order.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-secondary-400">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                <Link
                  href={`/dashboard/buyer/orders/${order.id}`}
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
