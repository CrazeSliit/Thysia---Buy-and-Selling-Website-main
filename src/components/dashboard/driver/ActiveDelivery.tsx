import { prisma } from '@/lib/prisma'
import { MapPin, Clock, Navigation } from 'lucide-react'
import Link from 'next/link'

interface ActiveDeliveryProps {
  userId: string
}

async function getActiveDelivery(userId: string) {
  try {
    // Get the driver profile first
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!driverProfile) {
      return null
    }

    // Get active delivery
    const delivery = await prisma.delivery.findFirst({
      where: {
        driverId: driverProfile.id,
        status: {
          in: ['PICKED_UP', 'EN_ROUTE'] // Active statuses
        }
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                name: true,
                email: true
              }
            },
            items: {
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
              take: 1 // Just get the first item for display
            }
          }
        }
      }
    })

    return delivery
  } catch (error) {
    console.error('Error fetching active delivery:', error)
    return null
  }
}

export default async function ActiveDelivery({ userId }: ActiveDeliveryProps) {
  const delivery = await getActiveDelivery(userId)

  if (!delivery) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-secondary-400" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No Active Delivery</h3>
        <p className="text-secondary-500 mb-4">
          You don't have any active deliveries at the moment.
        </p>
        <Link
          href="/dashboard/driver/shipments"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          View Available Deliveries
        </Link>
      </div>
    )
  }

  const statusConfig = {
    PICKED_UP: {
      label: 'Picked Up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    EN_ROUTE: {
      label: 'En Route',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  }

  const status = statusConfig[delivery.status as keyof typeof statusConfig]
  const firstItem = delivery.order.items[0]

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Delivery Status */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status?.color} ${status?.bgColor}`}>
            <Clock className="w-4 h-4 mr-2" />
            {status?.label}
          </div>
          <span className="text-sm text-secondary-500">
            Order #{delivery.order.id.slice(-8)}
          </span>
        </div>

        {/* Customer Info */}
        <div className="bg-secondary-50 rounded-lg p-4">
          <h4 className="font-medium text-secondary-900 mb-2">Customer</h4>
          <p className="text-sm text-secondary-600">{delivery.order.buyer.name}</p>
          <p className="text-xs text-secondary-500">{delivery.order.buyer.email}</p>
        </div>

        {/* Order Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-secondary-900">Order Details</h4>
          {firstItem && (
            <div className="text-sm text-secondary-600">
              <p>{firstItem.product.name}</p>
              <p className="text-xs text-secondary-500">
                From: {firstItem.product.seller.businessName || 'Unknown Seller'}
              </p>
              {delivery.order.items.length > 1 && (
                <p className="text-xs text-secondary-500">
                  +{delivery.order.items.length - 1} more item{delivery.order.items.length - 1 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t">
          <Link
            href={`/dashboard/driver/shipments/${delivery.id}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Navigation className="w-4 h-4 mr-2" />
            View Details & Navigate
          </Link>
          
          <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50">
            Update Status
          </button>
        </div>

        {/* Map Placeholder */}
        <div className="bg-secondary-100 rounded-lg h-32 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
            <p className="text-sm text-secondary-500">Map integration coming soon</p>
            <p className="text-xs text-secondary-400">
              This will show pickup and delivery locations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
