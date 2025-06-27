import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for user creation
const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUYER', 'SELLER', 'DRIVER', 'ADMIN'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role value',
  }),
  isActive: z.boolean().optional().default(true),
})

// GET - Fetch all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {}

    if (role) {
      whereClause.role = role
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    }

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          buyerProfile: {
            select: {
              id: true,
              phone: true,
              _count: {
                select: {
                  addresses: true,
                  cartItems: true
                }
              }
            }
          },
          sellerProfile: {
            select: {
              id: true,
              businessName: true,
              isVerified: true,
              _count: {
                select: {
                  products: true
                }
              }
            }
          },
          driverProfile: {
            select: {
              id: true,
              vehicleType: true,
              isVerified: true,
              isAvailable: true
            }
          },
          _count: {
            select: {
              orders: true,
              reviews: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = userCreateSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user with transaction to ensure profile creation
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          role: validatedData.role,
          isActive: validatedData.isActive,
        }
      })

      // Create appropriate profile based on role
      if (validatedData.role === 'BUYER') {
        await tx.buyerProfile.create({
          data: { userId: newUser.id }
        })
      } else if (validatedData.role === 'SELLER') {
        await tx.sellerProfile.create({
          data: { userId: newUser.id }
        })
      } else if (validatedData.role === 'DRIVER') {
        await tx.driverProfile.create({
          data: { userId: newUser.id }
        })
      }

      return newUser
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        ...result,
        password: undefined, // Don't return password
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
