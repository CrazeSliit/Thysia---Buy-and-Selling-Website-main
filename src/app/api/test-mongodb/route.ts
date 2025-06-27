import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeDatabase } from '@/lib/db-init'

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL format:', process.env.DATABASE_URL?.substring(0, 20) + '...')
    
    // Initialize database first
    const initResult = await initializeDatabase()
    console.log('Database initialization result:', initResult)
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test queries
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    const categoryCount = await prisma.category.count()
    console.log('Category count:', categoryCount)
    
    const categories = await prisma.category.findMany({
      take: 3,
      select: { id: true, name: true }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection and initialization successful',
      data: {
        initialization: initResult,
        userCount,
        categoryCount,
        sampleCategories: categories,
        environment: process.env.NODE_ENV,
        databaseConnected: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ MongoDB test failed:', error)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: false, 
      error: 'MongoDB connection/initialization failed',
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
