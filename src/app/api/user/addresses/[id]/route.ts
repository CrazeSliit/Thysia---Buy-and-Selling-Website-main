import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for address updates
const addressUpdateSchema = z.object({
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
  isDefault: z.boolean().optional(),
})

// Helper function to verify address ownership
async function verifyAddressOwnership(addressId: string, userId: string) {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      buyer: {
        userId: userId
      }
    },
    include: {
      buyer: true
    }
  })

  return address
}

// GET - Fetch a specific address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const address = await verifyAddressOwnership(params.id, session.user.id)

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json({ address }, { status: 200 })
  } catch (error) {
    console.error('Error fetching address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT/PATCH - Update an existing address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = addressUpdateSchema.parse(body)

    // Verify address ownership
    const existingAddress = await verifyAddressOwnership(params.id, session.user.id)

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If setting as default, unset other default addresses
    if (validatedData.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { 
          buyerId: existingAddress.buyerId,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        type: validatedData.type,
        fullName: `${validatedData.firstName} ${validatedData.lastName}`,
        company: validatedData.company || '',
        phone: validatedData.phone || '',
        street: validatedData.address1 + (validatedData.address2 ? `, ${validatedData.address2}` : ''),
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        isDefault: validatedData.isDefault || false
      }
    })

    return NextResponse.json({ 
      message: 'Address updated successfully', 
      address: updatedAddress 
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating address:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Partially update an address (same as PUT for now)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}

// DELETE - Delete an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify address ownership
    const existingAddress = await verifyAddressOwnership(params.id, session.user.id)

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If deleting the default address, set another address as default
    if (existingAddress.isDefault) {
      const otherAddress = await prisma.address.findFirst({
        where: {
          buyerId: existingAddress.buyerId,
          id: { not: params.id }
        },
        orderBy: { createdAt: 'asc' }
      })

      if (otherAddress) {
        await prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        })
      }
    }

    // Delete the address
    await prisma.address.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Address deleted successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
