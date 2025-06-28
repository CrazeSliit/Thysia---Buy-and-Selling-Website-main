import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      environment: process.env.NODE_ENV,
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      timestamp: new Date().toISOString(),
      environmentVariables: {
        DATABASE_URL: {
          exists: !!process.env.DATABASE_URL,
          format: process.env.DATABASE_URL?.startsWith('mongodb') ? 'Valid MongoDB' : 'Invalid/Missing',
          length: process.env.DATABASE_URL?.length || 0,
          preview: process.env.DATABASE_URL?.substring(0, 30) + '...' || 'NOT_SET'
        },
        NEXTAUTH_SECRET: {
          exists: !!process.env.NEXTAUTH_SECRET,
          length: process.env.NEXTAUTH_SECRET?.length || 0,
          preview: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
        },
        NEXTAUTH_URL: {
          exists: !!process.env.NEXTAUTH_URL,
          value: process.env.NEXTAUTH_URL || 'NOT_SET',
          isProduction: process.env.NEXTAUTH_URL?.includes('vercel.app') || false
        }
      },
      vercelInfo: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown',
        env: process.env.VERCEL_ENV || 'unknown'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      data: envCheck
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
