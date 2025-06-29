import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for user update
const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER', 'DRIVER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'BANNED', 'DEACTIVATED']).optional(),
  notes: z.string().optional(),
  banReason: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET - Fetch specific user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        buyerProfile: {
          include: {
            addresses: true,
            wishlists: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            },
            _count: {
              select: {
                addresses: true,
                orders: true,
                wishlists: true
              }
            }
          }
        },
        sellerProfile: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                isActive: true,
                createdAt: true,
                _count: {
                  select: {
                    orderItems: true
                  }
                }
              },
              take: 10,
              orderBy: { createdAt: 'desc' }
            },
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        driverProfile: true,
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        notifications: {
          select: {
            id: true,
            type: true,
            message: true,
            isRead: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            orders: true,
            notifications: true,
            messagesSent: true,
            messagesReceived: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate additional statistics
    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      where: { buyerId: user.id },
      _count: { status: true }
    })

    const totalSpent = await prisma.order.aggregate({
      where: { 
        buyerId: user.id,
        status: 'DELIVERED'
      },
      _sum: { totalAmount: true }
    })

    return NextResponse.json({
      user: {
        ...user,
        password: undefined,
        stats: {
          ordersByStatus: orderStats,
          totalSpent: totalSpent._sum.totalAmount || 0
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deactivating themselves
    if (params.id === session.user.id && validatedData.isActive === false) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    // Handle role change - create/delete profiles as needed
    if (validatedData.role && validatedData.role !== existingUser.role) {
      await prisma.$transaction(async (tx) => {
        // Delete old role profile
        if (existingUser.role === 'BUYER') {
          await tx.buyerProfile.deleteMany({ where: { userId: params.id } })
        } else if (existingUser.role === 'SELLER') {
          await tx.sellerProfile.deleteMany({ where: { userId: params.id } })
        } else if (existingUser.role === 'DRIVER') {
          await tx.driverProfile.deleteMany({ where: { userId: params.id } })
        }

        // Create new role profile
        if (validatedData.role === 'BUYER') {
          await tx.buyerProfile.create({ data: { userId: params.id } })
        } else if (validatedData.role === 'SELLER') {
          await tx.sellerProfile.create({ data: { userId: params.id } })
        } else if (validatedData.role === 'DRIVER') {
          await tx.driverProfile.create({ data: { userId: params.id } })
        }

        // Update user
        await tx.user.update({
          where: { id: params.id },
          data: validatedData
        })
      })
    } else {
      // Simple update without role change
      await prisma.user.update({
        where: { id: params.id },
        data: validatedData
      })
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        createdAt: updatedUser?.createdAt.toISOString(),
        updatedAt: updatedUser?.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user (Prisma will cascade delete related records due to onDelete: Cascade)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
