import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json({ 
        error: 'Access denied. Driver role required.' 
      }, { status: 403 })
    }

    // Extract order ID from shipment ID (format: shipment_<orderId>)
    const orderId = params.id.replace('shipment_', '')
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 })
    }

    // Transform order into shipment format
    const shipment = {
      id: params.id,
      orderId: order.id,
      status: getShipmentStatus(order.status),
      driverId: order.status === 'SHIPPED' ? 'assigned' : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      order: {
        id: order.id,
        orderNumber: order.id,
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
    }

    return NextResponse.json({ delivery: shipment })

  } catch (error) {
    console.error('Error fetching shipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      return NextResponse.json({ 
        error: 'Access denied. Driver role required.' 
      }, { status: 403 })
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Extract order ID from shipment ID (format: shipment_<orderId>)
    const orderId = params.id.replace('shipment_', '')
    
    // Convert shipment status to order status
    const orderStatus = getOrderStatus(status)
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus as any },
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
      status: getShipmentStatus(updatedOrder.status),
      driverId: 'assigned',
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt
    }

    return NextResponse.json({ 
      delivery: shipment,
      message: 'Delivery status updated successfully'
    })

  } catch (error) {
    console.error('Error updating shipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to convert order status to shipment status
function getShipmentStatus(orderStatus: string): string {
  switch (orderStatus) {
    case 'CONFIRMED':
      return 'PENDING'
    case 'PROCESSING':
      return 'PENDING_PICKUP'
    case 'SHIPPED':
      return 'OUT_FOR_DELIVERY'
    case 'DELIVERED':
      return 'DELIVERED'
    default:
      return 'PENDING'
  }
}

// Helper function to convert shipment status to order status
function getOrderStatus(shipmentStatus: string): string {
  switch (shipmentStatus) {
    case 'PENDING':
      return 'CONFIRMED'
    case 'PENDING_PICKUP':
      return 'PROCESSING'
    case 'OUT_FOR_DELIVERY':
      return 'SHIPPED'
    case 'DELIVERED':
      return 'DELIVERED'
    case 'FAILED':
      return 'CANCELLED'
    default:
      return 'CONFIRMED'
  }
}

