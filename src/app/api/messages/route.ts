import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Temporary mock data while Prisma client regenerates
const mockMessages = [
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
    },
    receiver: {
      id: 'buyer1', 
      name: 'John Doe',
      email: 'john@example.com',
      image: null
    }
  },
  {
    id: '2',
    senderId: 'seller2',
    receiverId: 'buyer1',
    subject: 'Product Question Response',
    content: 'Thank you for your question about the wireless headphones. The battery life is approximately 24 hours with active noise cancellation on.',
    isRead: true,
    orderId: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sender: {
      id: 'seller2',
      name: 'AudioGear Pro',
      email: 'support@audiogear.com',
      image: null
    },
    receiver: {
      id: 'buyer1',
      name: 'John Doe', 
      email: 'john@example.com',
      image: null
    }
  }
]

// GET - Fetch conversations/messages for the authenticated buyer
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
      // Return messages for specific conversation
      const messages = mockMessages.filter(m => 
        (m.senderId === session.user.id && m.receiverId === conversationId) ||
        (m.senderId === conversationId && m.receiverId === session.user.id)
      )

      return NextResponse.json({
        messages,
        totalCount: messages.length,
        hasMore: false
      })
    }

    // Return all conversations grouped by sender/receiver
    const userMessages = mockMessages.filter(m => 
      m.senderId === session.user.id || m.receiverId === session.user.id
    )

    // Group messages by conversation partner
    const conversationsMap = new Map()
    
    userMessages.forEach(message => {
      const partnerId = message.senderId === session.user.id ? message.receiverId : message.senderId
      const partner = message.senderId === session.user.id ? message.receiver : message.sender
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          partner,
          lastMessage: message,
          unreadCount: 0,
          messageCount: 0
        })
      }

      const conversation = conversationsMap.get(partnerId)
      conversation.messageCount++
      
      if (!message.isRead && message.receiverId === session.user.id) {
        conversation.unreadCount++
      }

      // Update last message if this one is newer
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message
      }
    })

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())

    return NextResponse.json({
      conversations,
      totalUnread: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Create a new message
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
    
    // Basic validation
    if (!body.receiverId || !body.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create mock message (in real app this would save to database)
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: session.user.id,
      receiverId: body.receiverId,
      content: body.content,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name || 'Anonymous',
        email: session.user.email || '',
        image: session.user.image
      }
    }

    return NextResponse.json({ 
      message: newMessage,
      success: true 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
