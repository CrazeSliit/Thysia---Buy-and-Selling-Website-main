import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for delivery status update
const deliveryStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PENDING_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
})

// GET - Fetch specific shipment details
export async function GET(
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

    // Fetch delivery details
    const delivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        driverId: driverProfile.id
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true,
                    seller: {
                      select: {
                        businessName: true,
                        user: {
                          select: {
                            name: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    return NextResponse.json({
      delivery: {
        ...delivery,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
        order: {
          ...delivery.order,
          createdAt: delivery.order.createdAt.toISOString(),
          updatedAt: delivery.order.updatedAt.toISOString(),
        }
      }
    })
  } catch (error) {
    console.error('Error fetching shipment details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update delivery status
export async function PATCH(
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

    const body = await request.json()
    const validatedData = deliveryStatusUpdateSchema.parse(body)

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Check if delivery exists and is assigned to this driver
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        driverId: driverProfile.id
      },
      include: {
        order: true
      }
    })

    if (!existingDelivery) {
      return NextResponse.json({ error: 'Shipment not found or access denied' }, { status: 404 })
    }

    // Validate status transition
    const currentStatus = existingDelivery.status
    const newStatus = validatedData.status

    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['PENDING_PICKUP', 'FAILED'],
      'PENDING_PICKUP': ['OUT_FOR_DELIVERY', 'FAILED'],
      'OUT_FOR_DELIVERY': ['DELIVERED', 'FAILED'],
      'DELIVERED': [], // Final state
      'FAILED': ['PENDING_PICKUP'] // Can retry
    }

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json({ 
        error: `Cannot change status from ${currentStatus} to ${newStatus}` 
      }, { status: 400 })
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // If delivered, also update order status
    if (newStatus === 'DELIVERED') {
      await prisma.order.update({
        where: { id: existingDelivery.orderId },
        data: { status: 'DELIVERED' }
      })
    }

    // TODO: Send notification to buyer about status change

    return NextResponse.json({
      message: `Delivery status updated to ${newStatus}`,
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
    console.error('Error updating delivery status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
