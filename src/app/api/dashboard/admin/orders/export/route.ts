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
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause for filtering
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
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

    // Get all orders matching criteria
    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
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
                price: true
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
      },
      orderBy: { createdAt: "desc" }
    });

    if (format === "csv") {
      // Flatten the data for CSV export
      const csvData = orders.map(order => ({
        "Order ID": order.id,
        "Customer Name": order.buyer.user.name,
        "Customer Email": order.buyer.user.email,
        "Status": order.status,
        "Total Amount": order.totalAmount,
        "Shipping Fee": order.shippingFee,
        "Taxes": order.taxes,
        "Final Amount": order.finalAmount,
        "Items Count": order.orderItems.length,
        "Shipping Address": `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
        "Created At": order.createdAt.toISOString(),
        "Updated At": order.updatedAt.toISOString()
      }));

      // Generate CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => 
          headers.map(header => 
            `"${(row as any)[header] || ""}"`
          ).join(",")
        )
      ].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON format
      const exportData = {
        exportDate: new Date().toISOString(),
        totalOrders: orders.length,
        filters: { status, dateFrom, dateTo },
        orders: orders.map(order => ({
          id: order.id,
          customer: {
            name: order.buyer.user.name,
            email: order.buyer.user.email
          },
          status: order.status,
          amounts: {
            total: order.totalAmount,
            shipping: order.shippingFee,
            taxes: order.taxes,
            final: order.finalAmount
          },
          itemsCount: order.orderItems.length,
          items: order.orderItems.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
            sellerName: item.seller.name
          })),
          shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zipCode: order.shippingAddress.zipCode,
            country: order.shippingAddress.country
          },
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }))
      };

      return NextResponse.json(exportData);
    }

  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
