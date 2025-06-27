import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mock messages for specific conversation
const mockConversationMessages = [
  {
    id: '1',
    senderId: 'seller1',
    receiverId: 'buyer1',
    subject: 'Order Update - #12345',
    content: 'Your order has been processed and will be shipped soon!',
    isRead: false,
    orderId: 'order1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sender: {
      id: 'seller1',
      name: 'TechStore',
      email: 'seller@techstore.com',
      image: null
    }
  },
  {
    id: '2',
    senderId: 'buyer1',
    receiverId: 'seller1',
    subject: 'Re: Order Update - #12345',
    content: 'Thank you for the update! When can I expect delivery?',
    isRead: true,
    orderId: 'order1',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    sender: {
      id: 'buyer1',
      name: 'John Doe',
      email: 'john@example.com',
      image: null
    }
  },
  {
    id: '3',
    senderId: 'seller1', 
    receiverId: 'buyer1',
    subject: 'Re: Order Update - #12345',
    content: 'You can expect delivery within 2-3 business days. You will receive tracking information via email once the package ships.',
    isRead: false,
    orderId: 'order1',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sender: {
      id: 'seller1',
      name: 'TechStore',
      email: 'seller@techstore.com',
      image: null
    }
  }
]

// Temporary: Comment out problematic Zod schema
// const updateMessageSchema = z.object({
//   isRead: z.boolean().optional(),
// })

// GET - Fetch messages in a specific conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Temporary: Use mock data instead of Prisma
    const conversationId = params.conversationId
    const messages = mockConversationMessages.filter(m => 
      (m.senderId === session.user.id && m.receiverId === conversationId) ||
      (m.senderId === conversationId && m.receiverId === session.user.id)
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send message in specific conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: params.conversationId },
      select: { id: true, role: true }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: params.conversationId,
        content: content.trim(),
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
