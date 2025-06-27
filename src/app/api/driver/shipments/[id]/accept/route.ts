import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Accept a shipment (assign to the current driver)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Check if driver is available
    if (!driverProfile.isAvailable) {
      return NextResponse.json({ error: 'Driver is not available' }, { status: 400 })
    }

    // Check if delivery exists and is available for assignment
    const delivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        driverId: null, // Only unassigned deliveries
        status: 'PENDING' // Only pending deliveries
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
            shippingAddress: true
          }
        }
      }
    })

    if (!delivery) {
      return NextResponse.json({ 
        error: 'Shipment not found or already assigned' 
      }, { status: 404 })
    }

    // Assign delivery to driver and update status
    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: { 
        driverId: driverProfile.id,
        status: 'PENDING_PICKUP'
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
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true,
                    seller: {
                      select: {
                        businessName: true
                      }
                    }
                  }
                }
              }
            },
            shippingAddress: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Shipment accepted successfully',
      delivery: {
        ...updatedDelivery,
        createdAt: updatedDelivery.createdAt.toISOString(),
        updatedAt: updatedDelivery.updatedAt.toISOString(),
        order: {
          ...updatedDelivery.order,
          createdAt: updatedDelivery.order.createdAt.toISOString(),
          updatedAt: updatedDelivery.order.updatedAt.toISOString(),
        }
      }
    })
  } catch (error) {
    console.error('Error accepting shipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}