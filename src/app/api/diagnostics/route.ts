import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      url_exists: !!process.env.DATABASE_URL,
      url_format: process.env.DATABASE_URL?.startsWith('mongodb') ? 'Valid' : 'Invalid',
      url_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
    },
    nextauth: {
      secret_exists: !!process.env.NEXTAUTH_SECRET,
      url_exists: !!process.env.NEXTAUTH_URL,
      url_value: process.env.NEXTAUTH_URL,
    },
    database_connection: null as any,
    collections: {} as any
  }

  try {
    // Test database connection
    await prisma.$connect()
    diagnostics.database_connection = 'Connected successfully'
    
    // Test collections
    const collections = {
      users: await prisma.user.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count()
    }
    diagnostics.collections = collections
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'success',
      message: 'All systems operational',
      diagnostics
    })
    
  } catch (error) {
    await prisma.$disconnect()
    
    diagnostics.database_connection = {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'System diagnostics failed',
      diagnostics
    }, { status: 500 })
  }
}
