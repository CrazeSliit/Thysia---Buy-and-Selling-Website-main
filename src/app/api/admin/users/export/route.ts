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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    // Build where clause for filtering
    const where: any = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (status && status !== "ALL") {
      if (status === "ACTIVE") {
        where.isActive = true;
      } else if (status === "SUSPENDED") {
        where.isActive = false;
      }
    }

    // Get all users matching criteria
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            notifications: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.order.aggregate({
          where: { 
            buyerId: user.id,
            status: "DELIVERED"
          },
          _sum: { totalAmount: true }
        });

        return {
          id: user.id,
          name: user.name || "N/A",
          email: user.email,
          role: user.role,
          status: user.isActive ? "ACTIVE" : "SUSPENDED",
          joinedAt: user.createdAt.toISOString(),
          lastActivity: user.updatedAt.toISOString(),
          totalOrders: user._count.orders,
          totalSpent: totalSpent._sum.totalAmount || 0,
          notifications: user._count.notifications
        };
      })
    );

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Name", 
        "Email",
        "Role",
        "Status",
        "Joined At",
        "Last Activity",
        "Total Orders",
        "Total Spent",
        "Notifications"
      ];

      const csvRows = [
        headers.join(","),
        ...usersWithStats.map(user => [
          user.id,
          `"${user.name}"`,
          user.email,
          user.role,
          user.status,
          user.joinedAt,
          user.lastActivity,
          user.totalOrders,
          user.totalSpent,
          user.notifications
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      users: usersWithStats,
      exportDate: new Date().toISOString(),
      totalUsers: usersWithStats.length,
      filters: { role, status }
    });

  } catch (error) {
    console.error("Error exporting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
