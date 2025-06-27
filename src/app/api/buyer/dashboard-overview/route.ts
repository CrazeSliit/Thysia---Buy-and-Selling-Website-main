import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = session.user.id

    // Fetch buyer overview data in parallel for better performance
    const [
      user,
      recentOrders,
      cartItemsCount,
      totalSpent
    ] = await Promise.all([
      // User details
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Cart items count
      prisma.cartItem.count({
        where: { buyerId: userId }
      }),

      // Total amount spent (from delivered orders)
      prisma.order.aggregate({
        where: {
          buyerId: userId,
          status: 'DELIVERED'
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate additional stats
    const totalOrders = await prisma.order.count({
      where: { buyerId: userId }
    })

    const pendingOrders = await prisma.order.count({
      where: {
        buyerId: userId,
        status: { in: ['PENDING', 'PROCESSING', 'SHIPPED'] }
      }
    })

    // Recent activity (orders from last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.order.count({
      where: {
        buyerId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        memberSince: user.createdAt
      },
      stats: {
        totalOrders,
        pendingOrders,
        cartItems: cartItemsCount,
        totalSpent: totalSpent._sum.totalAmount || 0,
        recentActivity
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        total: order.totalAmount,
        createdAt: order.createdAt,
        itemCount: order.orderItems.length,
        firstItem: order.orderItems[0] ? {
          productName: order.orderItems[0].product.name,
          productImage: order.orderItems[0].product.imageUrl,
          price: order.orderItems[0].price
        } : null
      }))
    })

  } catch (error) {
    console.error('Error fetching buyer dashboard overview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
