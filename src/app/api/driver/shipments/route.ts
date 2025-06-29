import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Get orders that are ready for shipping (CONFIRMED or PROCESSING status)
    // These would be orders that need to be picked up and delivered
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED']
        }
      },
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
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform orders into shipment format expected by the frontend
    const shipments = orders.map(order => ({
      id: `shipment_${order.id}`, // Create a shipment ID based on order ID
      orderId: order.id,
      status: getShipmentStatus(order.status),
      driverId: order.status === 'SHIPPED' ? 'assigned' : null, // Mock assignment for shipped orders
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      order: {
        id: order.id,
        orderNumber: order.id, // Using order ID as order number for now
        totalAmount: order.finalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        buyer: {
          id: order.buyer.id,
          name: order.buyer.user.name || 'Unknown',
          email: order.buyer.user.email
        },
        orderItems: order.orderItems.map(item => ({
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
          id: order.shippingAddress.id,
          firstName: order.shippingAddress.fullName.split(' ')[0] || '',
          lastName: order.shippingAddress.fullName.split(' ').slice(1).join(' ') || '',
          address1: order.shippingAddress.street,
          address2: order.shippingAddress.company || '',
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
          country: order.shippingAddress.country
        }
      }
    }))

    return NextResponse.json({ 
      deliveries: shipments, // Use 'deliveries' key as expected by frontend
      pagination: {
        page: 1,
        limit: 50,
        total: shipments.length,
        totalPages: 1
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to convert order status to shipment status
function getShipmentStatus(orderStatus: string): string {
  switch (orderStatus) {
    case 'CONFIRMED':
      return 'PENDING' // Ready to be picked up
    case 'PROCESSING':
      return 'PENDING_PICKUP' // Being prepared for pickup
    case 'SHIPPED':
      return 'OUT_FOR_DELIVERY' // Currently being delivered
    case 'DELIVERED':
      return 'DELIVERED'
    default:
      return 'PENDING'
  }
}


