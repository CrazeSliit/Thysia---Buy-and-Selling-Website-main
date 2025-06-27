import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for driver profile
const driverProfileSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  vehicleType: z.string().min(1, 'Vehicle type is required').optional(),
  licenseNumber: z.string().min(1, 'License number is required').optional(),
  isAvailable: z.boolean().optional(),
})

// GET - Fetch driver profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get driver profile with stats
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            deliveries: true
          }
        }
      }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Get additional stats
    const deliveryStats = await prisma.delivery.groupBy({
      by: ['status'],
      where: { driverId: driverProfile.id },
      _count: {
        id: true
      }
    })

    const completedDeliveries = deliveryStats.find(stat => stat.status === 'DELIVERED')?._count.id || 0
    const pendingDeliveries = deliveryStats.find(stat => stat.status === 'PENDING')?._count.id || 0
    const inProgressDeliveries = deliveryStats.find(stat => stat.status === 'OUT_FOR_DELIVERY')?._count.id || 0

    return NextResponse.json({
      profile: {
        ...driverProfile,
        createdAt: driverProfile.createdAt.toISOString(),
        updatedAt: driverProfile.updatedAt.toISOString(),
        user: {
          ...driverProfile.user,
          createdAt: driverProfile.user.createdAt.toISOString(),
        }
      },
      stats: {
        totalDeliveries: driverProfile._count.deliveries,
        completedDeliveries,
        pendingDeliveries,
        inProgressDeliveries
      }
    })
  } catch (error) {
    console.error('Error fetching driver profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update driver profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = driverProfileSchema.parse(body)

    // Check if profile exists
    const existingProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Update profile
    const updatedProfile = await prisma.driverProfile.update({
      where: { userId: session.user.id },
      data: {
        phone: validatedData.phone,
        vehicleType: validatedData.vehicleType,
        licenseNumber: validatedData.licenseNumber,
        isAvailable: validatedData.isAvailable,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        ...updatedProfile,
        createdAt: updatedProfile.createdAt.toISOString(),
        updatedAt: updatedProfile.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating driver profile:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
