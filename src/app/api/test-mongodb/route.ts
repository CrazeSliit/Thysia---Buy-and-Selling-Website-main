import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with mongodb:', process.env.DATABASE_URL?.startsWith('mongodb'))
    
    // Test basic connection
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test a simple query
    const categories = await prisma.category.findMany({
      take: 3,
      select: { id: true, name: true }
    })
    console.log('Categories found:', categories.length)
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      data: {
        userCount,
        categoriesCount: categories.length,
        sampleCategories: categories,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'MongoDB connection failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        environment: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
