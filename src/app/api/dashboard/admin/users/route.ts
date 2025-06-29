import { hash } from "bcryptjs";
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
        orderBy: { createdAt: "desc" },
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
      status: user.isActive ? "ACTIVE" : "SUSPENDED",
      joinedAt: user.createdAt,
      lastLogin: user.updatedAt,
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
    const { userId, userIds, action, data } = body;

    // Handle bulk actions
    if (userIds && Array.isArray(userIds)) {
      switch (action) {
        case "bulkActivate":
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isActive: true }
          });
          return NextResponse.json({
            message: `${userIds.length} users activated successfully`
          });

        case "bulkSuspend":
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isActive: false }
          });
          return NextResponse.json({
            message: `${userIds.length} users suspended successfully`
          });

        case "bulkDelete":
          // Soft delete by deactivating
          await prisma.user.updateMany({
            where: { 
              id: { in: userIds },
              role: { not: "ADMIN" } // Don't delete admins
            },
            data: { isActive: false }
          });
          return NextResponse.json({
            message: `${userIds.length} users deactivated successfully`
          });

        default:
          return NextResponse.json(
            { error: "Invalid bulk action" },
            { status: 400 }
          );
      }
    }

    // Handle single user actions
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
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        });

        return NextResponse.json({
          message: "User suspended successfully"
        });

      case "activate":
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        });

        return NextResponse.json({
          message: "User activated successfully"
        });

      case "toggleActive":
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { isActive: true }
        });

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        await prisma.user.update({
          where: { id: userId },
          data: { isActive: !user.isActive }
        });

        return NextResponse.json({
          message: `User ${!user.isActive ? 'activated' : 'suspended'} successfully`
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, role, sendWelcomeEmail } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Create appropriate profile based on role
    if (role === "BUYER") {
      await prisma.buyerProfile.create({
        data: {
          userId: newUser.id
        }
      });
    } else if (role === "SELLER") {
      await prisma.sellerProfile.create({
        data: {
          userId: newUser.id,
          businessName: name,
          isVerified: false
        }
      });
    } else if (role === "DRIVER") {
      await prisma.driverProfile.create({
        data: {
          userId: newUser.id,
          licenseNumber: "",
          vehicleType: "",
          isVerified: false
        }
      });
    }

    // TODO: Send welcome email if requested
    if (sendWelcomeEmail) {
      // Implement email sending logic here
      console.log(`Welcome email would be sent to ${email}`);
    }

    return NextResponse.json({
      message: "User created successfully",
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
