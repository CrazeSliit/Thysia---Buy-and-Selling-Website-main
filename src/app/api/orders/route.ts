import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for checkout
const checkoutSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })),
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE']).default('CREDIT_CARD'),
  paymentDetails: z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    cardholderName: z.string().optional()
  }).optional()
})

// GET - Fetch all orders for the authenticated buyer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // Optional filter by status
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { buyerId: buyerProfile.id }
    if (status) {
      where.status = status
    }

    // Fetch orders with product details
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: { select: { name: true } },
                seller: { select: { businessName: true } }
              }
            }
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where })

    // Calculate summary statistics
    const totalSpent = await prisma.order.aggregate({
      where: { buyerId: buyerProfile.id, status: 'DELIVERED' },
      _sum: { totalAmount: true }
    })

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: { buyerId: buyerProfile.id },
      _count: { status: true }
    })

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + orders.length < totalCount
      },
      summary: {
        totalSpent: totalSpent._sum.totalAmount || 0,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.status
          return acc
        }, {} as Record<string, number>)
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Create a new order (checkout process)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = checkoutSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { cartItems, shippingAddressId, billingAddressId, paymentMethod } = validationResult.data    // Verify all products exist and are available
    const productIds = cartItems.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        sellerId: true,
        seller: {
          select: {
            userId: true
          }
        }
      }
    })

    if (products.length !== cartItems.length) {
      return NextResponse.json(
        { error: 'Some products are no longer available' },
        { status: 400 }
      )
    }

    // Check stock availability
    for (const cartItem of cartItems) {
      const product = products.find(p => p.id === cartItem.productId)
      if (!product || product.stock < cartItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product?.name || 'Unknown'}` },
          { status: 400 }
        )
      }
    }    // Verify shipping address belongs to user
    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        buyerId: buyerProfile.id
      }
    })

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Invalid shipping address' },
        { status: 400 }
      )
    }

    // If billing address is provided, verify it too
    if (billingAddressId && billingAddressId !== shippingAddressId) {
      const billingAddress = await prisma.address.findFirst({
        where: {
          id: billingAddressId,
          buyerId: buyerProfile.id
        }
      })

      if (!billingAddress) {
        return NextResponse.json(
          { error: 'Invalid billing address' },
          { status: 400 }
        )
      }
    }    // Calculate totals
    let subtotal = 0
    const orderItemsData = cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId)!
      const itemTotal = product.price * cartItem.quantity
      subtotal += itemTotal
      
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtTime: product.price,
        totalPrice: itemTotal,
        sellerId: product.seller.userId // Use the seller's User ID, not SellerProfile ID
      }
    })

    const taxRate = 0.08 // 8% tax rate
    const shippingCost = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount + shippingCost

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`    // Debug logging
    console.log('Creating order with data:', {
      orderNumber,
      buyerId: session.user.id,
      shippingAddressId,
      billingAddressId: billingAddressId || shippingAddressId,
      orderItemsData,
      buyerProfile: buyerProfile.id
    })

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: buyerProfile.id,
          addressId: shippingAddressId,
          status: 'PENDING',
          totalAmount: totalAmount,
          shippingFee: shippingCost,
          taxes: taxAmount,
          finalAmount: totalAmount,
          userId: session.user.id,
          orderItems: {
            create: orderItemsData.map(item => ({
              productId: item.productId,
              sellerId: item.sellerId,
              quantity: item.quantity,
              price: item.priceAtTime
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              }
            }
          },
          shippingAddress: true
        }
      })

      // Update product stock
      for (const cartItem of cartItems) {
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: {
              decrement: cartItem.quantity
            }
          }
        })
      }      // Clear cart items (using BuyerProfile ID for CartItem relation)
      await tx.cartItem.deleteMany({
        where: {
          buyerId: buyerProfile.id,
          productId: { in: productIds }
        }
      })

      return newOrder
    })

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate payment processing
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CONFIRMED'
          }
        })
      } catch (error) {
        console.error('Error updating payment status:', error)
      }
    }, 2000)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        orderItems: order.orderItems
      },
      message: 'Order placed successfully!'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
