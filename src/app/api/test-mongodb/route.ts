import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL format:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    // Test database connection - this will create collections if they don't exist
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Try to count users (this will create the collection if it doesn't exist)
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test creating a simple query
    const categories = await prisma.category.findMany({
      take: 3,
      select: { id: true, name: true }
    })
    console.log('Categories found:', categories.length)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful - Collections created automatically',
      data: {
        userCount,
        categoriesCount: categories.length,
        sampleCategories: categories,
        environment: process.env.NODE_ENV,
        databaseConnected: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: false, 
      error: 'MongoDB connection failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        environment: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlFormat: process.env.DATABASE_URL?.startsWith('mongodb') ? 'Valid MongoDB URL' : 'Invalid URL format',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
