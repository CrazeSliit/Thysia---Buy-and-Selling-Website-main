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

    const order = await prisma.order.findUnique({
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
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error("Error fetching order:", error);
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
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date()
      },
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
            seller: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orderId = params.id;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // For safety, we'll set status to CANCELLED instead of hard delete
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });

  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
