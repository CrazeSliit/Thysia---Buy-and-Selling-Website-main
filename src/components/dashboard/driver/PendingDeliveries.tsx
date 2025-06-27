import { prisma } from '@/lib/prisma'
import { Package, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'

interface PendingDeliveriesProps {
  userId: string
}

async function getPendingDeliveries(userId: string) {
  try {
    // Get the driver profile first
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!driverProfile) {
      return []
    }

    // Get pending delivery requests (unassigned or assigned to this driver but not started)
    const deliveries = await prisma.delivery.findMany({
      where: {
        OR: [
          {
            driverId: null, // Unassigned
            status: 'PENDING'
          },
          {
            driverId: driverProfile.id,
            status: 'PENDING'
          }
        ]
      },
      include: {        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true,
            buyer: {
              select: {
                name: true
              }
            },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    seller: {
                      select: {
                        businessName: true
                      }
                    }
                  }
                }
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 5
    })

    return deliveries
  } catch (error) {
    console.error('Error fetching pending deliveries:', error)
    return []
  }
}

export default async function PendingDeliveries({ userId }: PendingDeliveriesProps) {
  const deliveries = await getPendingDeliveries(userId)

  if (deliveries.length === 0) {
    return (
      <div className="p-6 text-center">
        <Package className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No Pending Requests</h3>
        <p className="text-secondary-500">
          All caught up! New delivery requests will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {deliveries.map((delivery) => {
          const firstItem = delivery.order.orderItems[0]
          const isAssigned = delivery.driverId !== null

          return (
            <div key={delivery.id} className="border rounded-lg p-4 hover:bg-secondary-50 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-secondary-900">
                    Order #{delivery.order.id.slice(-8)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isAssigned 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isAssigned ? 'Assigned' : 'Available'}
                  </span>
                </div>                <div className="text-sm text-secondary-500">
                  ${delivery.order.totalAmount.toFixed(2)}
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Package className="w-4 h-4 text-secondary-400 mr-2" />
                  <span className="text-secondary-600">
                    {delivery.order.buyer.name} • {delivery.order.orderItems.length} item{delivery.order.orderItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {firstItem && (
                  <div className="text-sm text-secondary-600 ml-6">
                    {firstItem.product.name}                    {delivery.order.orderItems.length > 1 && (
                      <span className="text-secondary-500">
                        {' '}+{delivery.order.orderItems.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-start text-sm ml-6">
                  <MapPin className="w-4 h-4 text-secondary-400 mr-2 mt-0.5" />
                  <div className="text-secondary-600">
                    <div>Pickup: {firstItem?.product.seller.businessName || 'Unknown Seller'}</div>
                    <div>Delivery: Customer Address</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {!isAssigned ? (
                  <>
                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </button>
                    <button className="px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50">
                      Details
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      <Clock className="w-4 h-4 mr-1" />
                      Start Delivery
                    </button>
                    <button className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
