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
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (status && status !== "ALL") {
      // Note: We don't have a status field in the user model yet
      // This would need to be added to the schema
      // where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    // Get users with their order counts
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Format user data for the frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      role: user.role,
      status: "ACTIVE", // Mock status since we don't have this field yet
      joinedAt: user.createdAt,
      lastLogin: user.updatedAt, // Mock last login
      orders: user._count.orders
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    switch (action) {
      case "updateRole":
        if (!data.role) {
          return NextResponse.json(
            { error: "Role is required" },
            { status: 400 }
          );
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role: data.role },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });

        return NextResponse.json({
          message: "User role updated successfully",
          user: updatedUser
        });

      case "suspend":
        // TODO: Add status field to user model
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: { status: "SUSPENDED" }
        // });

        return NextResponse.json({
          message: "User suspended successfully"
        });

      case "activate":
        // TODO: Add status field to user model
        // await prisma.user.update({
        //   where: { id: userId },
        //   data: { status: "ACTIVE" }
        // });

        return NextResponse.json({
          message: "User activated successfully"
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
