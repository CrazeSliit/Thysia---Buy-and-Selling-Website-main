import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for cart item
const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
})

// GET - Fetch all cart items for the authenticated buyer
export async function GET() {
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

    // Fetch cart items with product details
    const cartItems = await prisma.cartItem.findMany({
      where: { buyerId: buyerProfile.id },
      include: {
        product: {
          include: {
            category: {
              select: { name: true }
            },
            seller: {
              select: { 
                id: true,
                businessName: true 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate cart summary
    const cartSummary = {
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
      itemCount: cartItems.length
    }

    return NextResponse.json({ 
      cartItems: cartItems.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        product: {
          ...item.product,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
        }
      })),
      summary: cartSummary
    })
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add item to cart or update quantity if exists
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cartItemSchema.parse(body)

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: { 
        id: validatedData.productId,
        isActive: true 
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not available' }, { status: 404 })
    }

    // Check if product is already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: validatedData.productId
        }
      }
    })

    let cartItem
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { 
          quantity: existingCartItem.quantity + validatedData.quantity 
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          buyerId: buyerProfile.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true
            }
          }
        }
      })
    }

    return NextResponse.json({ 
      message: existingCartItem ? 'Cart updated successfully' : 'Item added to cart',
      cartItem: {
        ...cartItem,
        createdAt: cartItem.createdAt.toISOString(),
        updatedAt: cartItem.updatedAt.toISOString(),
      }
    }, { status: existingCartItem ? 200 : 201 })

  } catch (error) {
    console.error('Error adding to cart:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cartItemSchema.parse(body)

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Check if cart item exists
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: validatedData.productId
        }
      }
    })

    if (!existingCartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Update cart item quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: validatedData.quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Cart item updated successfully',
      cartItem: {
        ...updatedCartItem,
        createdAt: updatedCartItem.createdAt.toISOString(),
        updatedAt: updatedCartItem.updatedAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Error updating cart item:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Check if cart item exists
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: productId
        }
      }
    })

    if (!existingCartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: existingCartItem.id }
    })

    return NextResponse.json({ 
      message: 'Item removed from cart successfully'
    })

  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
