import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for product update
const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').optional(),
  categoryId: z.string().min(1, 'Category is required').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  stock: z.number().min(0, 'Stock cannot be negative').int('Stock must be a whole number').optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// GET - Fetch a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        sellerId: sellerProfile.id
      },
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
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productUpdateSchema.parse(body)

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        sellerId: sellerProfile.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If categoryId is being updated, verify it exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category || !category.isActive) {
        return NextResponse.json({ error: 'Invalid or inactive category' }, { status: 400 })
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: {
          select: { 
            id: true,
            name: true 
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Product updated successfully',
      product: {
        ...updatedProduct,
        createdAt: updatedProduct.createdAt.toISOString(),
        updatedAt: updatedProduct.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Check if product exists and belongs to seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        sellerId: sellerProfile.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has any orders (soft delete instead of hard delete)
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: params.id }
    })

    if (hasOrders) {
      // Soft delete - mark as inactive instead of deleting
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'Product marked as inactive due to existing orders'
      })
    } else {
      // Hard delete if no orders exist
      await prisma.product.delete({
        where: { id: params.id }
      })

      return NextResponse.json({
        message: 'Product deleted successfully'
      })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
