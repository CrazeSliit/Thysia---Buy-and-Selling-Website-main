import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Running comprehensive diagnostics...')

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      
      // Environment variables check
      env: {
        DATABASE_URL: {
          exists: !!process.env.DATABASE_URL,
          isValid: process.env.DATABASE_URL?.startsWith('mongodb') || false,
          preview: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT_SET'
        },
        NEXTAUTH_SECRET: {
          exists: !!process.env.NEXTAUTH_SECRET,
          length: process.env.NEXTAUTH_SECRET?.length || 0
        },
        NEXTAUTH_URL: {
          exists: !!process.env.NEXTAUTH_URL,
          value: process.env.NEXTAUTH_URL || 'NOT_SET'
        }
      },

      // Database connectivity
      database: {
        canConnect: false,
        error: null as string | null,
        collections: [] as string[]
      }
    }

    // Test database connection
    try {
      await prisma.$connect()
      diagnostics.database.canConnect = true
      
      // Try to get some basic info
      const userCount = await prisma.user.count()
      const categoryCount = await prisma.category.count()
      
      diagnostics.database.collections = [
        `users: ${userCount}`,
        `categories: ${categoryCount}`
      ]
      
      await prisma.$disconnect()
    } catch (error) {
      diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error'
      await prisma.$disconnect()
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnostics completed',
      data: diagnostics
    })

  } catch (error) {
    console.error('Diagnostics error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}