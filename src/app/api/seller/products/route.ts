import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for product creation/update
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  stock: z.number().min(0, 'Stock cannot be negative').int('Stock must be a whole number'),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
})

// GET - Fetch all products for the authenticated seller
export async function GET() {  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Fetch all products for this seller
    const products = await prisma.product.findMany({
      where: { sellerId: sellerProfile.id },
      include: {
        category: {
          select: { 
            id: true,
            name: true 
          }
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      products: products.map(product => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)
    
    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Get or create a default "General" category if no category is specified
    let categoryId: string;
    
    // Check if a "General" category exists, create if not
    let defaultCategory = await prisma.category.findFirst({
      where: { name: 'General' }
    });

    if (!defaultCategory) {
      defaultCategory = await prisma.category.create({
        data: {
          name: 'General',
          description: 'General products without specific category',
          isActive: true
        }
      });
    }

    categoryId = defaultCategory.id;    // Create new product
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        categoryId: categoryId,
        sellerId: sellerProfile.id,
        imageUrl: validatedData.imageUrl || '',
        stock: validatedData.stock,
        isFeatured: validatedData.isFeatured || false,
        isActive: validatedData.isActive !== false,
      },
      include: {
        category: {
          select: { 
            id: true,
            name: true 
          }
        }      }
    })

    return NextResponse.json({
      message: 'Product created successfully',
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    }, { status: 201 })  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
