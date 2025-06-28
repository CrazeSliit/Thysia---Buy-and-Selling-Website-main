import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db-init'

export async function POST() {
  try {
    console.log('🔄 Manual database initialization requested...')
    
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Database initialization API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to initialize database',
    endpoint: '/api/init-db',
    method: 'POST',
    description: 'Manually initialize MongoDB collections and seed basic data'
  })
}