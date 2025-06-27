import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get driver earnings overview
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get driver profile
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!driverProfile) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // For now, return mock earnings data since delivery system is not fully implemented
    const mockEarnings = {
      totalEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      completedDeliveries: 0,
      pendingPayments: 0,
      averageRating: 0,
      recentDeliveries: []
    }

    return NextResponse.json({
      earnings: mockEarnings,
      message: 'Driver earnings retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching driver earnings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
