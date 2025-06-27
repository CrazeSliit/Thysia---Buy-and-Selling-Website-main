import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUYER', 'SELLER', 'DRIVER'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = signupSchema.parse(body)
    const { name, email, password, role } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)    // Create user with role-specific profile
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
    }    // Add role-specific profile data
    switch (role) {
      case 'BUYER':
        userData.buyerProfile = { create: {} }
        break
      case 'SELLER':
        userData.sellerProfile = {
          create: {
            businessName: `${name}'s Store`,
            isVerified: true, // Auto-verify new sellers
          }
        }
        break
      case 'DRIVER':
        userData.driverProfile = {
          create: {
            isAvailable: true,
          }
        }
        break
    }

    // Create user in database
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        buyerProfile: true,
        sellerProfile: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          }
        },
        driverProfile: {
          select: {
            id: true,
            isAvailable: true,
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
