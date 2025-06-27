import { formatDistanceToNow, format } from 'date-fns'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Star,
  RotateCcw,
  Download
} from 'lucide-react'
import Link from 'next/link'

interface OrderDetailsProps {
  order: {
    id: string
    status: string
    total: number
    createdAt: string
    updatedAt: string
    items: Array<{
      id: string
      quantity: number
      price: number
      product: {
        id: string
        name: string
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
  { status: 'PENDING', label: 'Order Placed', description: 'Your order has been received' },
  { status: 'PROCESSING', label: 'Processing', description: 'Your order is being prepared' },
  { status: 'SHIPPED', label: 'Shipped', description: 'Your order is on the way' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered' },
]

export default function OrderDetails({ order }: OrderDetailsProps) {
  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const StatusIcon = status.icon
  const currentStatusIndex = orderTimeline.findIndex(item => item.status === order.status)
  const subtotal = order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const shipping = 0 // For now, free shipping
  const tax = subtotal * 0.1 // 10% tax

  return (
    <div className="space-y-6">
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
            <p className="text-2xl font-bold text-secondary-900">${order.total.toFixed(2)}</p>
            <p className="text-sm text-secondary-500">
              Ordered on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
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
              <h2 className="text-lg font-semibold text-secondary-900">Order Items</h2>
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
                      <p className="text-sm text-secondary-500 mb-2">
                        Sold by: {item.product.seller.businessName || 'Unknown Seller'}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary-600">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <p className="text-lg font-semibold text-secondary-900">
                          ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Item Actions */}
                      {order.status === 'DELIVERED' && (
                        <div className="mt-3 flex space-x-3">
                          <button className="inline-flex items-center px-3 py-1 border border-secondary-300 rounded-md text-xs font-medium text-secondary-700 bg-white hover:bg-secondary-50">
                            <Star className="w-3 h-3 mr-1" />
                            Write Review
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-secondary-300 rounded-md text-xs font-medium text-secondary-700 bg-white hover:bg-secondary-50">
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Return Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary and Actions */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Subtotal</span>
                <span className="text-secondary-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Shipping</span>                <span className="text-secondary-900">
                  {shipping === 0 ? 'Free' : `$${(shipping as number).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Tax</span>
                <span className="text-secondary-900">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-secondary-900">Total</span>
                  <span className="text-lg font-semibold text-secondary-900">
                    ${order.total.toFixed(2)}
                  </span>
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
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </button>
              
              {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancel Order
                </button>
              )}
              
              {order.status === 'SHIPPED' && (
                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50">
                  <Truck className="w-4 h-4 mr-2" />
                  Track Package
                </button>
              )}
              
              <Link
                href="/dashboard/buyer/orders"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
