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
    const where: any = {
      status: {
        in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
      }
    };

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

    // Get all shipments matching criteria
    const shipments = await prisma.order.findMany({
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
              include: {
                sellerProfile: {
                  select: {
                    businessName: true,
                    businessAddress: true
                  }
                }
              },
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    if (format === "csv") {
      // Flatten the data for CSV export
      const csvData = shipments.map(shipment => ({
        "Shipment ID": shipment.id,
        "Order Date": shipment.createdAt.toISOString().split('T')[0],
        "Status": shipment.status,
        "Customer Name": shipment.buyer.user.name,
        "Customer Email": shipment.buyer.user.email,
        "Shipping Address": `${shipment.shippingAddress.street}, ${shipment.shippingAddress.city}, ${shipment.shippingAddress.state} ${shipment.shippingAddress.zipCode}`,
        "Items Count": shipment.orderItems.length,
        "Total Value": shipment.finalAmount,
        "Shipping Fee": shipment.shippingFee,
        "Seller Names": shipment.orderItems.map(item => 
          item.seller.sellerProfile?.businessName || item.seller.name
        ).join("; "),
        "Last Updated": shipment.updatedAt.toISOString()
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
          "Content-Disposition": `attachment; filename="shipments_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON format
      const exportData = {
        exportDate: new Date().toISOString(),
        totalShipments: shipments.length,
        filters: { status, dateFrom, dateTo },
        shipments: shipments.map(shipment => ({
          id: shipment.id,
          status: shipment.status,
          customer: {
            name: shipment.buyer.user.name,
            email: shipment.buyer.user.email
          },
          shippingAddress: {
            street: shipment.shippingAddress.street,
            city: shipment.shippingAddress.city,
            state: shipment.shippingAddress.state,
            zipCode: shipment.shippingAddress.zipCode,
            country: shipment.shippingAddress.country
          },
          amounts: {
            total: shipment.totalAmount,
            shipping: shipment.shippingFee,
            taxes: shipment.taxes,
            final: shipment.finalAmount
          },
          items: shipment.orderItems.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
            seller: {
              name: item.seller.name,
              businessName: item.seller.sellerProfile?.businessName,
              email: item.seller.email
            }
          })),
          dates: {
            ordered: shipment.createdAt,
            lastUpdated: shipment.updatedAt
          }
        }))
      };

      return NextResponse.json(exportData);
    }

  } catch (error) {
    console.error("Error exporting shipments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
