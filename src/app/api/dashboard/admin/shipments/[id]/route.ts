import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orderId = params.id;

    const shipment = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
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
                imageUrl: true,
                price: true,
                stock: true
              }
            },
            seller: {
              include: {
                sellerProfile: {
                  select: {
                    id: true,
                    businessName: true,
                    businessAddress: true,
                    businessPhone: true
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
      }
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json({ shipment });

  } catch (error) {
    console.error("Error fetching shipment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { status, notes, trackingNumber, estimatedDelivery, driverId } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Note: These fields would need to be added to the Order model
    // if (trackingNumber) updateData.trackingNumber = trackingNumber;
    // if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    // if (driverId) updateData.driverId = driverId;
    // if (notes) updateData.notes = notes;

    const updatedShipment = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
            product: true,
            seller: {
              include: {
                sellerProfile: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, shipment: updatedShipment });

  } catch (error) {
    console.error("Error updating shipment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
