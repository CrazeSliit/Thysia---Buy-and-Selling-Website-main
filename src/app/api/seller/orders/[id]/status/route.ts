import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for order status update
const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
})

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = orderStatusUpdateSchema.parse(body)

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Check if order exists and contains seller's products
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        items: {
          some: {
            product: {
              sellerId: sellerProfile.id
            }
          }
        }
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: sellerProfile.id
            }
          },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    // Validate status transition (basic business logic)
    const currentStatus = existingOrder.status
    const newStatus = validatedData.status

    // Define allowed status transitions
    const allowedTransitions: Record<string, string[]> = {
      'PENDING': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [], // Final state
      'CANCELLED': [] // Final state
    }

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json({ 
        error: `Cannot change status from ${currentStatus} to ${newStatus}` 
      }, { status: 400 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status: newStatus },
      include: {
        buyer: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          where: {
            product: {
              sellerId: sellerProfile.id
            }
          },
          include: {
            product: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    // TODO: Send notification to buyer about status change
    // TODO: If status is SHIPPED, create/update delivery record

    return NextResponse.json({
      message: `Order status updated to ${newStatus}`,
      order: {
        ...updatedOrder,
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
