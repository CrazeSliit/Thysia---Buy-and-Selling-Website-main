import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for seller profile
const sellerProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(255, 'Business name too long').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  address: z.string().min(1, 'Address is required').optional(),
})

// GET - Fetch seller profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get seller profile with stats
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Get additional stats
    const stats = await prisma.product.aggregate({
      where: { sellerId: sellerProfile.id },
      _count: {
        id: true
      },
      _sum: {
        stock: true
      }
    })

    const activeProductsCount = await prisma.product.count({
      where: { 
        sellerId: sellerProfile.id,
        isActive: true 
      }
    })

    const totalOrders = await prisma.orderItem.count({
      where: {
        product: {
          sellerId: sellerProfile.id
        }
      }
    })

    return NextResponse.json({
      profile: {
        ...sellerProfile,
        createdAt: sellerProfile.createdAt.toISOString(),
        updatedAt: sellerProfile.updatedAt.toISOString(),
        user: {
          ...sellerProfile.user,
          createdAt: sellerProfile.user.createdAt.toISOString(),
        }
      },
      stats: {
        totalProducts: stats._count.id || 0,
        activeProducts: activeProductsCount,
        totalStock: stats._sum.stock || 0,
        totalOrders: totalOrders
      }
    })
  } catch (error) {
    console.error('Error fetching seller profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update seller profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = sellerProfileSchema.parse(body)

    // Check if profile exists
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Update profile
    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId: session.user.id },
      data: {
        businessName: validatedData.businessName,
        businessPhone: validatedData.phone,
        businessAddress: validatedData.address,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        ...updatedProfile,
        createdAt: updatedProfile.createdAt.toISOString(),
        updatedAt: updatedProfile.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating seller profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
