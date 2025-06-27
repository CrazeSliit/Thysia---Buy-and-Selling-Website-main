import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple test to verify MongoDB connection
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('MongoDB connection error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
