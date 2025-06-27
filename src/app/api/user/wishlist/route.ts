import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for wishlist item
const wishlistItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

// GET - Fetch all wishlist items for the authenticated buyer
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

    // Fetch wishlist items with product details
    const wishlistItems = await prisma.wishlistItem.findMany({
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

    return NextResponse.json({ 
      wishlistItems: wishlistItems.map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        product: {
          ...item.product,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching wishlist items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add item to wishlist
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
    const validatedData = wishlistItemSchema.parse(body)

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

    // Check if product is already in wishlist
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: validatedData.productId
        }
      }
    })

    if (existingWishlistItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 })
    }

    // Create new wishlist item
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        buyerId: buyerProfile.id,
        productId: validatedData.productId
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

    return NextResponse.json({ 
      message: 'Item added to wishlist',
      wishlistItem: {
        ...wishlistItem,
        createdAt: wishlistItem.createdAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove item from wishlist
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

    // Check if wishlist item exists
    const existingWishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: productId
        }
      }
    })

    if (!existingWishlistItem) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }

    // Delete wishlist item
    await prisma.wishlistItem.delete({
      where: { id: existingWishlistItem.id }
    })

    return NextResponse.json({ 
      message: 'Item removed from wishlist successfully'
    })

  } catch (error) {
    console.error('Error removing wishlist item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
