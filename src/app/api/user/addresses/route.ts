import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for address creation/update
const addressSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address line 1 is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
})

// GET - Fetch all addresses for the authenticated buyer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // Fetch all addresses for this buyer
    const addresses = await prisma.address.findMany({
      where: { buyerId: buyerProfile.id },
      orderBy: [
        { isDefault: 'desc' }, // Default addresses first
        { createdAt: 'desc' }   // Then by creation date
      ]
    })

    return NextResponse.json({ addresses }, { status: 200 })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!buyerProfile) {
      return NextResponse.json({ error: 'Buyer profile not found' }, { status: 404 })
    }

    // If this is set as default, unset other default addresses
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: { 
          buyerId: buyerProfile.id,
          isDefault: true 
        },
        data: { isDefault: false }
      })
    }

    // If this is the first address, make it default
    const existingAddressCount = await prisma.address.count({
      where: { buyerId: buyerProfile.id }
    })

    const isFirstAddress = existingAddressCount === 0

    // Create the new address
    const address = await prisma.address.create({
      data: {
        buyerId: buyerProfile.id,
        type: validatedData.type,
        fullName: `${validatedData.firstName} ${validatedData.lastName}`,
        company: validatedData.company || '',
        phone: validatedData.phone || '',
        street: validatedData.address1 + (validatedData.address2 ? `, ${validatedData.address2}` : ''),
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        isDefault: validatedData.isDefault || isFirstAddress
      }
    })

    return NextResponse.json({ 
      message: 'Address created successfully', 
      address 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating address:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
