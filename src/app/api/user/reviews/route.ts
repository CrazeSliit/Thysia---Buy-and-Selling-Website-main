import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for review
const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
})

// GET - Fetch all reviews for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user reviews with product details
    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            price: true,
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
      reviews: reviews.map(review => ({
        ...review,
        createdAt: review.createdAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: validatedData.productId
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }

    // Verify user has purchased this product (optional business logic)
    const userOrder = await prisma.order.findFirst({
      where: {
        buyerId: session.user.id,
        items: {
          some: {
            productId: validatedData.productId
          }
        }
      }
    })

    if (!userOrder) {
      return NextResponse.json({ error: 'You can only review products you have purchased' }, { status: 403 })
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId,
        rating: validatedData.rating,
        comment: validatedData.comment || null
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Review created successfully',
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
