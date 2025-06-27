import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get platform statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingReviews,
      todaySignups
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total products count
      prisma.product.count(),
      
      // Total orders count
      prisma.order.count(),
      
      // Total revenue (sum of all completed orders)
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true }
      }),
      
      // Pending reviews count (mock for now since we don't have reviews table)
      Promise.resolve(47),
      
      // Today's signups
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Calculate additional metrics
    const onlineUsers = Math.floor(totalUsers * 0.05); // Mock: 5% of users online
    const activeDisputes = Math.floor(totalOrders * 0.001); // Mock: 0.1% dispute rate

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingReviews,
      activeDisputes,
      onlineUsers,
      todaySignups
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
