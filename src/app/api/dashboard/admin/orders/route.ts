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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { buyer: { user: { name: { contains: search, mode: "insensitive" } } } },
        { buyer: { user: { email: { contains: search, mode: "insensitive" } } } }
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get orders with related data
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          shippingAddress: true,
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true
                }
              },
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    // Calculate summary statistics
    const stats = await prisma.order.aggregate({
      _sum: {
        finalAmount: true
      },
      _count: {
        id: true
      },
      where
    });

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const pagination = {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    };

    return NextResponse.json({
      orders,
      pagination,
      stats: {
        totalOrders: stats._count.id,
        totalRevenue: stats._sum.finalAmount || 0,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, orderIds, action, status, notes } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // Handle bulk actions
    if (action.startsWith("bulk") && orderIds && orderIds.length > 0) {
      const updateData: any = {};

      switch (action) {
        case "bulkUpdateStatus":
          if (!status) {
            return NextResponse.json({ error: "Status is required for bulk update" }, { status: 400 });
          }
          updateData.status = status;
          break;

        case "bulkCancel":
          updateData.status = "CANCELLED";
          break;

        case "bulkConfirm":
          updateData.status = "CONFIRMED";
          break;

        case "bulkShip":
          updateData.status = "SHIPPED";
          break;

        default:
          return NextResponse.json({ error: "Unknown bulk action" }, { status: 400 });
      }

      updateData.updatedAt = new Date();

      await prisma.order.updateMany({
        where: {
          id: { in: orderIds }
        },
        data: updateData
      });

      return NextResponse.json({ success: true, message: `Bulk action ${action} completed` });
    }

    // Handle single order actions
    if (orderId) {
      const updateData: any = {};

      switch (action) {
        case "updateStatus":
          if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
          }
          updateData.status = status;
          break;

        case "cancel":
          updateData.status = "CANCELLED";
          break;

        case "confirm":
          updateData.status = "CONFIRMED";
          break;

        case "ship":
          updateData.status = "SHIPPED";
          break;

        case "deliver":
          updateData.status = "DELIVERED";
          break;

        case "refund":
          updateData.status = "REFUNDED";
          break;

        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }

      updateData.updatedAt = new Date();

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          buyer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          orderItems: {
            include: {
              product: true,
              seller: true
            }
          }
        }
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ error: "Order ID or Order IDs required" }, { status: 400 });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
