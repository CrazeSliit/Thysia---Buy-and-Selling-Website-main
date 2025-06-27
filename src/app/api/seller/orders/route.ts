import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for order status update
const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status value',
  }),
})

// GET - Fetch all orders for the authenticated seller
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      orderItems: {
        some: {
          product: {
            sellerId: sellerProfile.id
          }
        }
      }
    }

    if (status) {
      whereClause.status = status
    }

    // Fetch orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          buyer: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              phone: true,
              addresses: {
                where: { isDefault: true },
                select: {
                  fullName: true,
                  phone: true,
                  street: true,
                  city: true,
                  state: true,
                  zipCode: true,
                  country: true
                }
              }
            }
          },
          orderItems: {
            where: {
              product: {
                sellerId: sellerProfile.id
              }
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    return NextResponse.json({
      orders: orders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
