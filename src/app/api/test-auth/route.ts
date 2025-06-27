import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET - Test authentication endpoint
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'Not authenticated' 
      }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      message: 'Authentication test successful'
    })

  } catch (error) {
    console.error('Error testing authentication:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
