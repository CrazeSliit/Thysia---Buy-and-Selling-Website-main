import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Get wishlist items
    const wishlistItems = await prisma.wishlist.findMany({
      where: { buyerId: buyerProfile.id },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              select: {
                businessName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      wishlist: wishlistItems.map(item => ({
        id: item.id,
        productId: item.product.id,
        product: item.product,
        addedAt: item.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = addToWishlistSchema.parse(body)

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        buyerId_productId: {
          buyerId: buyerProfile.id,
          productId: productId
        }
      }
    })

    if (existingWishlistItem) {
      return NextResponse.json({ error: 'Product already in wishlist' }, { status: 409 })
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        buyerId: buyerProfile.id,
        productId: productId
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({ 
      message: 'Product added to wishlist successfully',
      wishlistItem
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Remove from wishlist
    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        buyerId: buyerProfile.id,
        productId: productId
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json({ error: 'Product not found in wishlist' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Product removed from wishlist successfully'
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
