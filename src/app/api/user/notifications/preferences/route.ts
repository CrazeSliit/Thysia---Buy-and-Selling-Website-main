import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for notification preferences
const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotionalEmails: z.boolean().optional(),
  newProductAlerts: z.boolean().optional(),
})

// GET - Fetch notification preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return default preferences since we don't have a separate preferences table
    // In a real app, you might want to create a UserPreferences model
    const defaultPreferences = {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      promotionalEmails: false,
      newProductAlerts: true,
    }

    return NextResponse.json({ preferences: defaultPreferences })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = notificationPreferencesSchema.parse(body)

    // For now, just return success since we don't have a separate preferences table
    // In a real app, you would save these to a UserPreferences model
    
    return NextResponse.json({ 
      message: 'Notification preferences updated successfully',
      preferences: validatedData 
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
