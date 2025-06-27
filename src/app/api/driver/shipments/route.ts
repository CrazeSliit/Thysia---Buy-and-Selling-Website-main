import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all shipments for the authenticated driver
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit    // Build where clause
    const whereClause: any = {
      OR: [
        {
          // Show deliveries assigned to this driver
          driverId: driverProfile.id
        },
        {
          // Show unassigned deliveries that are still PENDING (available for pickup)
          driverId: null,
          status: 'PENDING'
        }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    // Fetch deliveries with pagination
    const [deliveries, totalCount] = await Promise.all([
      prisma.delivery.findMany({
        where: whereClause,
        include: {          order: {
            include: {
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              orderItems: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                      imageUrl: true,
                      seller: {
                        select: {
                          businessName: true
                        }
                      }
                    }
                  }
                }
              },
              shippingAddress: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      }),
      prisma.delivery.count({ where: whereClause })
    ])

    return NextResponse.json({
      deliveries: deliveries.map(delivery => ({
        ...delivery,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
        order: {
          ...delivery.order,
          createdAt: delivery.order.createdAt.toISOString(),
          updatedAt: delivery.order.updatedAt.toISOString(),
        }
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching driver shipments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
