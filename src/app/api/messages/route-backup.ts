import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating a message
const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject too long'),
  content: z.string().min(1, 'Message content is required'),
  orderId: z.string().optional() // Optional order reference
})

// Schema for updating message status
const updateMessageSchema = z.object({
  isRead: z.boolean().optional(),
})

// GET - Fetch conversations for the authenticated buyer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Fetch specific conversation messages
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: session.user.id,
              receiverId: conversationId
            },
            {
              senderId: conversationId,
              receiverId: session.user.id
            }
          ]
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
          },
          order: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      return NextResponse.json({ messages })
    } else {
      // Fetch all conversations (grouped by participant)
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id }
          ]
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Group conversations by participant
      const groupedConversations = new Map()
      
      conversations.forEach(message => {
        const otherUserId = message.senderId === session.user.id ? message.receiverId : message.senderId
        const otherUser = message.senderId === session.user.id ? message.receiver : message.sender
        
        if (!groupedConversations.has(otherUserId)) {
          groupedConversations.set(otherUserId, {
            participant: otherUser,
            lastMessage: message,
            unreadCount: 0
          })
        }
        
        // Count unread messages
        if (message.receiverId === session.user.id && !message.isRead) {
          const conversation = groupedConversations.get(otherUserId)
          conversation.unreadCount++
        }
      })

      const conversationList = Array.from(groupedConversations.values())

      return NextResponse.json({ conversations: conversationList })
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createMessageSchema.parse(body)

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId },
      select: { id: true, role: true }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // Verify order exists if orderId is provided
    if (validatedData.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: validatedData.orderId,
          buyerId: session.user.id
        }
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: validatedData.receiverId,
        subject: validatedData.subject,
        content: validatedData.content,
        orderId: validatedData.orderId,
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
        },
        order: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
