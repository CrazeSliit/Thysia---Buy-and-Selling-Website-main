import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json({ 
        error: 'Access denied. Driver role required.' 
      }, { status: 403 })
    }

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Extract order ID from shipment ID (format: shipment_<orderId>)
    const orderId = params.id.replace('shipment_', '')
    
    // Update order status to PROCESSING (which maps to PENDING_PICKUP for shipments)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' as any },
      include: {
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        shippingAddress: true,
        orderItems: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    businessName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Transform updated order into shipment format
    const shipment = {
      id: params.id,
      orderId: updatedOrder.id,
      status: 'PENDING_PICKUP',
      driverId: 'assigned',
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id,
        totalAmount: updatedOrder.finalAmount,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        buyer: {
          id: updatedOrder.buyer.id,
          name: updatedOrder.buyer.user.name || 'Unknown',
          email: updatedOrder.buyer.user.email
        },
        orderItems: updatedOrder.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          priceAtTime: item.price,
          totalPrice: item.price * item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl || '',
            seller: {
              businessName: item.product.seller?.businessName || 'Unknown Seller'
            }
          }
        })),
        shippingAddress: {
          id: updatedOrder.shippingAddress.id,
          firstName: updatedOrder.shippingAddress.fullName.split(' ')[0] || '',
          lastName: updatedOrder.shippingAddress.fullName.split(' ').slice(1).join(' ') || '',
          address1: updatedOrder.shippingAddress.street,
          address2: updatedOrder.shippingAddress.company || '',
          city: updatedOrder.shippingAddress.city,
          state: updatedOrder.shippingAddress.state,
          zipCode: updatedOrder.shippingAddress.zipCode,
          country: updatedOrder.shippingAddress.country
        }
      }
    }

    return NextResponse.json({ 
      delivery: shipment,
      message: 'Shipment accepted successfully'
    })

  } catch (error) {
    console.error('Error accepting delivery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

