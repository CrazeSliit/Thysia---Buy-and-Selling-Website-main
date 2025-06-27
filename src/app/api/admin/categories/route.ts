import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for category
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255, 'Category name too long'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isActive: z.boolean().optional().default(true),
})

// GET - Fetch all categories
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
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build where clause
    const whereClause: any = {}

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // Fetch categories with product counts
    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      categories: categories.map(category => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new category
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
    const validatedData = categorySchema.parse(body)

    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 })
    }

    // Create category
    const newCategory = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive,
      }
    })

    return NextResponse.json({
      message: 'Category created successfully',
      category: {
        ...newCategory,
        createdAt: newCategory.createdAt.toISOString(),
        updatedAt: newCategory.updatedAt.toISOString(),
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
