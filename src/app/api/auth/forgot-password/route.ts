import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success for security reasons (don't reveal if email exists)
    // In a real implementation, you would send an email here
    return NextResponse.json({
      message: 'If your email is registered, you will receive a password reset link.',
      success: true
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email address', success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'An error occurred. Please try again.', success: false },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to request password reset' },
    { status: 405 }
  )
}