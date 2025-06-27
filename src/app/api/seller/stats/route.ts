import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 });
    }

    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Parallel queries for better performance
    const [
      totalProducts,
      activeProducts,
      totalOrderItems,
      thisMonthOrderItems,
      lastMonthOrderItems,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalReviews,
      avgRating
    ] = await Promise.all([
      // Total products count
      prisma.product.count({
        where: { sellerId: sellerProfile.id }
      }),

      // Active products count
      prisma.product.count({
        where: { 
          sellerId: sellerProfile.id,
          isActive: true 
        }
      }),

      // Total order items sold
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id }
        },
        _sum: { quantity: true }
      }),

      // This month order items
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id },
          order: {
            createdAt: { gte: startOfMonth }
          }
        },
        _sum: { quantity: true }
      }),

      // Last month order items
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id },
          order: {
            createdAt: { 
              gte: lastMonth,
              lte: endOfLastMonth
            }
          }
        },
        _sum: { quantity: true }
      }),

      // Total revenue from delivered orders
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id },
          order: { status: 'DELIVERED' }
        },
        _sum: { totalPrice: true }
      }),

      // This month revenue
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id },
          order: {
            status: 'DELIVERED',
            createdAt: { gte: startOfMonth }
          }
        },
        _sum: { totalPrice: true }
      }),

      // Last month revenue
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId: sellerProfile.id },
          order: {
            status: 'DELIVERED',
            createdAt: { 
              gte: lastMonth,
              lte: endOfLastMonth
            }
          }
        },
        _sum: { totalPrice: true }
      }),

      // Total reviews count
      prisma.review.count({
        where: {
          product: { sellerId: sellerProfile.id }
        }
      }),

      // Average rating
      prisma.review.aggregate({
        where: {
          product: { sellerId: sellerProfile.id }
        },
        _avg: { rating: true }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const thisMonthOrders = thisMonthOrderItems._sum.quantity || 0;
    const lastMonthOrders = lastMonthOrderItems._sum.quantity || 0;
    const ordersGrowth = calculateGrowth(thisMonthOrders, lastMonthOrders);    const currentRevenue = thisMonthRevenue._sum?.totalPrice || 0;
    const previousRevenue = lastMonthRevenue._sum?.totalPrice || 0;
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);

    // Get total unique orders (not just order items)
    const totalOrders = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: { sellerId: sellerProfile.id }
          }
        }
      }
    });

    const thisMonthOrders_count = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: { sellerId: sellerProfile.id }
          }
        },
        createdAt: { gte: startOfMonth }
      }
    });

    const lastMonthOrders_count = await prisma.order.count({
      where: {
        orderItems: {
          some: {
            product: { sellerId: sellerProfile.id }
          }
        },
        createdAt: { 
          gte: lastMonth,
          lte: endOfLastMonth
        }
      }
    });

    const orderCountGrowth = calculateGrowth(thisMonthOrders_count, lastMonthOrders_count);

    // Calculate conversion rate (mock calculation)
    const totalViews = totalProducts * 100; // Mock: assume 100 views per product
    const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenue._sum?.totalPrice || 0,
        thisMonthRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        
        totalProducts,
        activeProducts,
        
        totalOrders,
        thisMonthOrders: thisMonthOrders_count,
        orderCountGrowth: Math.round(orderCountGrowth * 10) / 10,
        
        totalItemsSold: totalOrderItems._sum.quantity || 0,
        thisMonthItemsSold: thisMonthOrders,
        itemsGrowth: Math.round(ordersGrowth * 10) / 10,
        
        totalReviews,
        avgRating: avgRating._avg.rating || 0,
        
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
